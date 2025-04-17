import { removeDarkModeMediaQueries } from './stylesheet';

export const setupHeadObserver = () => {
  const head = document.head;
  if (!head) return;

  // 处理所有已存在的样式表
  const processExistingStylesheets = () => {
    // 处理已存在的 link 标签
    const linkElements = head.querySelectorAll('link[rel*="stylesheet"]');
    linkElements.forEach((link) => {
      if (link instanceof HTMLLinkElement) {
        if (link.sheet) {
          removeDarkModeMediaQueries();
        } else {
          link.addEventListener('load', () => {
            removeDarkModeMediaQueries();
          });
        }
      }
    });

    // 处理已存在的 style 标签
    const styleElements = head.querySelectorAll('style');
    if (styleElements.length > 0) {
      removeDarkModeMediaQueries();
    }
  };

  // 初始处理已存在的样式表
  processExistingStylesheets();

  // 监听 head 中的样式表变化
  const stylesheetObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLLinkElement && node.rel.includes('stylesheet')) {
            if (node.sheet) {
              removeDarkModeMediaQueries();
            } else {
              node.addEventListener('load', () => {
                removeDarkModeMediaQueries();
              });
            }
          } else if (node instanceof HTMLStyleElement) {
            removeDarkModeMediaQueries();
          }
        });
      }
    });
  });

  stylesheetObserver.observe(head, {
    childList: true,
    subtree: true,
  });

  return stylesheetObserver;
};
