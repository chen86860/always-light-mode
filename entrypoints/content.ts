import { addLightModeStyle } from './utils/styles/light-mode';
import { setupHeadObserver } from './utils/observers/head-observer';
import { setupClassObserver } from './utils/observers/class-observer';
import { lightModeEnabledStorage } from './utils/storage';
import { override } from './utils/override';

export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_start',
  main: async () => {
    const isEnabled = await lightModeEnabledStorage.getValue();

    if (!isEnabled) return;

    // Override matchMedia
    override();

    // 监听 document.head 的创建和变化
    const setupDocumentObserver = () => {
      const documentObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList') {
            mutation.addedNodes.forEach((node) => {
              if (node instanceof HTMLHeadElement || document.head) {
                setupHeadObserver();
                documentObserver.disconnect();
              }
            });
          }
        });
      });

      documentObserver.observe(document.documentElement, {
        childList: true,
      });

      return documentObserver;
    };

    // 如果 head 已经存在，直接设置监听
    if (document.head) {
      setupHeadObserver();
    } else {
      setupDocumentObserver();
    }

    // 设置 class 观察者
    setupClassObserver();

    // 添加 light mode 样式
    addLightModeStyle();
  },
});
