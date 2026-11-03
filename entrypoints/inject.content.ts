import { SHADOW_ATTACHED_EVENT } from './utils/observers/shadow-observer';
import { DARK_THEME_NAMES } from './utils/theme-names';
import { isInjectableDocument } from './utils/document-type';

/**
 * 运行在页面 MAIN world 的补丁，由 background 通过 scripting.registerContentScripts
 * 以 world: 'MAIN' + document_start 注册，同步执行于页面脚本之前。
 * 补丁常驻，但可通过 ISOLATED world 派发的事件运行时启停（见 content.ts）。
 */
export default defineContentScript({
  matches: ['<all_urls>'],
  registration: 'runtime',
  main() {
    // XML/SVG/RSS 等非网页文档不做任何改写，页面对象也保持原样
    if (!isInjectableDocument()) return;

    // 注入即启用；content.ts 的 enable/disable 事件负责运行时切换
    let enabled = true;
    document.addEventListener('__almEnable', () => (enabled = true));
    document.addEventListener('__almDisable', () => (enabled = false));

    // 媒体查询条件改写：dark → 恒假，light → 恒真
    const DARK_QUERY = /\(\s*prefers-color-scheme\s*:\s*dark\s*\)/gi;
    const LIGHT_QUERY = /\(\s*prefers-color-scheme\s*:\s*light\s*\)/gi;
    const ALWAYS_FALSE = '(min-width: 999999px)';
    const ALWAYS_TRUE = '(min-width: 0px)';

    // CSS 文本内的条件改写（不带外层括号，保留原括号结构）
    const DARK_CONDITION = /prefers-color-scheme\s*:\s*dark/gi;
    const LIGHT_CONDITION = /prefers-color-scheme\s*:\s*light/gi;

    // --- matchMedia：改写 query 后委托原生实现，返回真正的 MediaQueryList ---
    // 用 min-width 改写而非 'not all'，保证 `screen and (...)` 这类复合查询仍然合法
    const nativeMatchMedia = window.matchMedia.bind(window);
    window.matchMedia = function matchMedia(query: string): MediaQueryList {
      const q = String(query);
      if (enabled && /prefers-color-scheme/i.test(q)) {
        const rewritten = q.replace(DARK_QUERY, ALWAYS_FALSE).replace(LIGHT_QUERY, ALWAYS_TRUE);
        const mql = nativeMatchMedia(rewritten);
        // 对页面隐藏改写痕迹，media 仍返回原始 query
        try {
          Object.defineProperty(mql, 'media', { value: q, enumerable: true });
        } catch {
          // 定义失败不影响 matches 结果
        }
        return mql;
      }
      return nativeMatchMedia(q);
    };

    // --- constructed stylesheets：CSS-in-JS 框架经由这些 API 写入暗色规则 ---
    const rewriteCssText = (text: unknown) =>
      enabled && typeof text === 'string'
        ? text
            .replace(DARK_CONDITION, 'min-width: 999999px')
            .replace(LIGHT_CONDITION, 'min-width: 0px')
        : text;

    const sheetProto = CSSStyleSheet.prototype;
    const nativeReplace = sheetProto.replace;
    const nativeReplaceSync = sheetProto.replaceSync;
    sheetProto.replace = function (text: string) {
      return nativeReplace.call(this, rewriteCssText(text) as string);
    };
    sheetProto.replaceSync = function (text: string) {
      return nativeReplaceSync.call(this, rewriteCssText(text) as string);
    };

    for (const proto of [CSSStyleSheet.prototype, CSSGroupingRule.prototype]) {
      const nativeInsertRule = proto.insertRule;
      proto.insertRule = function (rule: string, index?: number) {
        return nativeInsertRule.call(this, rewriteCssText(rule) as string, index);
      };
    }

    // --- 存储的主题偏好：很多站点启动时读 localStorage 决定暗色，在源头改写为 light ---
    const THEME_KEY = /theme|color-?scheme|color-?mode|appearance|dark/i;
    const DARK_KEY = /dark/i;
    // 带 /g 的正则不能复用做 .test()（lastIndex 会残留），检测与替换分开
    const DARK_VALUE = /dark|night/i;
    const DARK_VALUE_REPLACE = /dark|night/gi;

    const rewriteStoredTheme = (key: string, value: unknown): unknown => {
      if (!enabled || typeof value !== 'string' || !THEME_KEY.test(key)) return value;
      // 子串替换而非整值替换：兼容 JSON 形式的存储值（如 {"mode":"dark"}）
      if (DARK_VALUE.test(value)) return value.replace(DARK_VALUE_REPLACE, 'light');
      if (DARK_THEME_NAMES.has(value.trim().toLowerCase())) return 'light';
      // darkMode=true / 1 这类布尔式偏好
      if (DARK_KEY.test(key)) {
        if (value === 'true') return 'false';
        if (value === '1') return '0';
      }
      return value;
    };

    try {
      // localStorage.theme 这类属性式读取不经过 getItem，包一层 Proxy 拦截
      const nativeLocalStorage = window.localStorage;
      const proxy = new Proxy(nativeLocalStorage, {
        get(target, prop) {
          const value = Reflect.get(target, prop);
          if (typeof prop === 'string' && typeof value === 'string') {
            return rewriteStoredTheme(prop, value);
          }
          // 函数原样返回、不做 bind：bind 会让 localStorage.constructor 丢掉 .prototype，
          // 页面里 `this === localStorage` 的判断也会失效（Stripe 启动时依赖两者，否则白屏）
          return value;
        },
      });

      // 原生 Storage 方法要求 this 是真正的 Storage，以 Proxy 为 this 调用时还原成原对象
      const unwrap = (storage: Storage) => (storage === proxy ? nativeLocalStorage : storage);
      for (const method of ['setItem', 'removeItem', 'clear', 'key'] as const) {
        const native = Storage.prototype[method] as (...args: unknown[]) => unknown;
        (Storage.prototype as unknown as Record<string, unknown>)[method] = function (
          this: Storage,
          ...args: unknown[]
        ) {
          return native.apply(unwrap(this), args);
        };
      }
      const nativeGetItem = Storage.prototype.getItem;
      Storage.prototype.getItem = function (key: string) {
        return rewriteStoredTheme(String(key), nativeGetItem.call(unwrap(this), key)) as string | null;
      };

      Object.defineProperty(window, 'localStorage', {
        get: () => proxy,
        configurable: true,
      });
    } catch {
      // 沙箱 iframe / 隐私设置下访问 localStorage 会抛异常，跳过该增强
    }

    // --- shadow DOM：创建时通知 ISOLATED world 处理其中的样式表 ---
    const nativeAttachShadow = Element.prototype.attachShadow;
    Element.prototype.attachShadow = function (init: ShadowRootInit) {
      const root = nativeAttachShadow.call(this, init);
      const notify = () => {
        try {
          this.dispatchEvent(new Event(SHADOW_ATTACHED_EVENT, { bubbles: true, composed: true }));
        } catch {
          // 通知失败由内容脚本的兜底扫描补齐
        }
      };
      // 元素多在 attachShadow 之后才连接到文档，微任务里再通知；仍未连接的靠兜底扫描
      if (this.isConnected) {
        notify();
      } else {
        queueMicrotask(notify);
      }
      return root;
    };
  },
});
