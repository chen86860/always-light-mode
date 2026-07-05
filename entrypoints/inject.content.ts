import { SHADOW_ATTACHED_EVENT } from './utils/observers/shadow-observer';

/**
 * 运行在页面 MAIN world 的补丁，由 background 通过 scripting.registerContentScripts
 * 以 world: 'MAIN' + document_start 注册，同步执行于页面脚本之前。
 */
export default defineContentScript({
  matches: ['<all_urls>'],
  registration: 'runtime',
  main() {
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
      if (/prefers-color-scheme/i.test(q)) {
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
      typeof text === 'string'
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
