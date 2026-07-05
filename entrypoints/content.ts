import { addLightModeStyle } from './utils/styles/light-mode';
import { removeDarkModeMediaQueries } from './utils/styles/dark-mode';
import { setupStyleObserver } from './utils/observers/style-observer';
import { setupThemeObserver } from './utils/observers/theme-observer';
import { setupShadowObserver } from './utils/observers/shadow-observer';

/**
 * ISOLATED world 内容脚本，由 background 通过 scripting.registerContentScripts
 * 动态注册——是否启用、哪些站点排除都由注册状态决定，脚本本身无需再查询 storage。
 */
export default defineContentScript({
  matches: ['<all_urls>'],
  registration: 'runtime',
  main() {
    // 强制 color-scheme: light（head 未就绪时挂在 documentElement 上）
    addLightModeStyle();

    // 移除 html/body 上的暗色 class / data-theme 等属性，并持续监听
    setupThemeObserver();

    // 处理现有及后续注入的 <link>/<style>/<meta name="color-scheme">
    setupStyleObserver();

    // 处理 open shadow root 内的样式表
    setupShadowObserver();

    // 页面加载完成后全量兜底清扫一次（覆盖 adoptedStyleSheets 的后期赋值等观察不到的路径）
    window.addEventListener('load', () => removeDarkModeMediaQueries());
  },
});
