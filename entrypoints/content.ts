import { addLightModeStyle, removeLightModeStyle, restoreMetaColorScheme } from './utils/styles/light-mode';
import { neutralizeDarkStyles, restoreDarkRules } from './utils/styles/dark-mode';
import { setupStyleObserver, teardownStyleObserver } from './utils/observers/style-observer';
import { setupThemeObserver, teardownThemeObserver } from './utils/observers/theme-observer';
import { setupShadowObserver, teardownShadowObserver } from './utils/observers/shadow-observer';
import { setupAppleMusicFix, teardownAppleMusicFix } from './utils/sites/apple-music';
import { lightModeEnabledStorage, disabledSitesStorage } from './utils/storage';
import { isInjectableDocument } from './utils/document-type';

/** 通知 MAIN world 补丁启停，见 inject.content.ts */
export const STATE_EVENTS = { enable: '__almEnable', disable: '__almDisable' } as const;

/**
 * ISOLATED world 内容脚本，由 background 通过 scripting.registerContentScripts
 * 动态注册——脚本被注入即代表"当前站点应启用"，无需在加载路径上查询 storage。
 * 运行中的开关切换通过 storage watch 无刷新启停。
 */
export default defineContentScript({
  matches: ['<all_urls>'],
  registration: 'runtime',
  main() {
    // popup 用 ping 探测本页是否已注入脚本（未注入且需要启用时才刷新页面）。
    // 注册在最前面：即使本页不做任何改写，也要应答，避免 popup 白刷新一次。
    browser.runtime.onMessage.addListener(
      (message: unknown, _sender: unknown, sendResponse: (response: string) => void) => {
        if (message === 'alm-ping') sendResponse('alm-pong');
      },
    );

    // XML/SVG/RSS 等由浏览器内置的 XML 查看器渲染，文档树就是用户看到的内容，
    // 注入 <style>、改写属性都会直接污染显示（且这类文档不吃 color-scheme）
    if (!isInjectableDocument()) return;

    let active = false;

    const enable = () => {
      if (active) return;
      active = true;
      document.dispatchEvent(new Event(STATE_EVENTS.enable));
      addLightModeStyle();
      setupThemeObserver();
      setupStyleObserver();
      setupShadowObserver();
      setupAppleMusicFix();
    };

    const disable = () => {
      if (!active) return;
      active = false;
      document.dispatchEvent(new Event(STATE_EVENTS.disable));
      teardownThemeObserver();
      teardownStyleObserver();
      teardownShadowObserver();
      teardownAppleMusicFix();
      restoreDarkRules();
      restoreMetaColorScheme();
      removeLightModeStyle();
    };

    // 注入即启用
    enable();

    // 页面加载完成后全量兜底清扫一次（覆盖 adoptedStyleSheets 的后期赋值等观察不到的路径）
    window.addEventListener('load', () => {
      if (active) neutralizeDarkStyles();
    });

    // 无刷新响应开关变化
    const applyState = async () => {
      const enabled = await lightModeEnabledStorage.getValue();
      const disabledSites = await disabledSitesStorage.getValue();
      const on = enabled && !disabledSites.includes(location.hostname);
      on ? enable() : disable();
    };
    lightModeEnabledStorage.watch(applyState);
    disabledSitesStorage.watch(applyState);
  },
});
