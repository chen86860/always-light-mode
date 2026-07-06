import { addLightModeStyle, removeLightModeStyle, restoreMetaColorScheme } from './utils/styles/light-mode';
import { neutralizeDarkStyles, restoreDarkRules } from './utils/styles/dark-mode';
import { setupStyleObserver, teardownStyleObserver } from './utils/observers/style-observer';
import { setupThemeObserver, teardownThemeObserver } from './utils/observers/theme-observer';
import { setupShadowObserver, teardownShadowObserver } from './utils/observers/shadow-observer';
import { lightModeEnabledStorage, disabledSitesStorage } from './utils/storage';

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
    let active = false;

    const enable = () => {
      if (active) return;
      active = true;
      document.dispatchEvent(new Event(STATE_EVENTS.enable));
      addLightModeStyle();
      setupThemeObserver();
      setupStyleObserver();
      setupShadowObserver();
    };

    const disable = () => {
      if (!active) return;
      active = false;
      document.dispatchEvent(new Event(STATE_EVENTS.disable));
      teardownThemeObserver();
      teardownStyleObserver();
      teardownShadowObserver();
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

    // popup 用 ping 探测本页是否已注入脚本（未注入且需要启用时才刷新页面）
    browser.runtime.onMessage.addListener(
      (message: unknown, _sender: unknown, sendResponse: (response: string) => void) => {
        if (message === 'alm-ping') sendResponse('alm-pong');
      },
    );
  },
});
