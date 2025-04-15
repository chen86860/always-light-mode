export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_start',
  main: async () => {
    const isEnabled = ;

    if (isEnabled) {
      // Override matchMedia
      (function () {
        // 保存原始方法
        const originalMatchMedia = window.matchMedia;
        console.log({ originalMatchMedia });

        // 复写
        window.matchMedia = function (query) {
          if (query === '(prefers-color-scheme: dark)') {
            return {
              matches: false, // 表示不是暗色模式
              media: query,
              onchange: null,
              addListener: () => {}, // 兼容旧版
              removeListener: () => {},
              addEventListener: () => {}, // 兼容新版
              removeEventListener: () => {},
              dispatchEvent: () => false,
            };
          }

          return originalMatchMedia(query); // 其他媒体查询照常
        };
      })();

      const removeDarkModeMediaQueries = () => {
        // Get all stylesheets
        const stylesheets = document.styleSheets;

        for (let i = 0; i < stylesheets.length; i++) {
          const stylesheet = stylesheets[i];

          try {
            // Get all CSS rules
            const rules = stylesheet.cssRules || stylesheet.rules;
            if (!rules) continue;

            // Track rules to remove
            const rulesToRemove = [];

            // Find rules with dark mode media query
            for (let j = 0; j < rules.length; j++) {
              const rule = rules[j];
              if (rule instanceof CSSMediaRule && rule.conditionText.includes('prefers-color-scheme: dark')) {
                rulesToRemove.push(j);
              }
            }

            // Remove rules in reverse order to maintain correct indices
            for (let j = rulesToRemove.length - 1; j >= 0; j--) {
              stylesheet.deleteRule(rulesToRemove[j]);
            }
          } catch (e) {
            // Skip stylesheets that can't be accessed due to CORS
            console.warn('Could not access stylesheet:', e);
          }
        }
      };

      // 监听 document.head 的创建
      const headObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList') {
            mutation.addedNodes.forEach((node) => {
              if (node instanceof HTMLHeadElement) {
                // 当 head 元素创建后，开始监听样式表变化
                const stylesheetObserver = new MutationObserver((mutations) => {
                  mutations.forEach((mutation) => {
                    if (mutation.type === 'childList') {
                      mutation.addedNodes.forEach((node) => {
                        if (node instanceof HTMLLinkElement && node.rel.includes('stylesheet')) {
                          node.addEventListener('load', () => {
                            removeDarkModeMediaQueries();
                          });
                        } else if (node instanceof HTMLStyleElement) {
                          removeDarkModeMediaQueries();
                        }
                      });
                    }
                  });
                });

                // 开始监听 head 中的样式表变化
                stylesheetObserver.observe(node, {
                  childList: true,
                  subtree: true,
                });

                // 初始执行一次，处理已存在的样式表
                removeDarkModeMediaQueries();

                // 停止监听 head 的创建
                headObserver.disconnect();
              }
            });
          }
        });
      });

      // 开始监听 document 的变化，等待 head 元素创建
      headObserver.observe(document.documentElement, {
        childList: true,
      });

      // 移除 dark class 的辅助函数
      const removeDarkClass = (element: HTMLElement) => {
        if (element?.classList?.contains('dark')) {
          element.classList.remove('dark');
        }

        if (element?.classList?.contains('theme-dark')) {
          element.classList.remove('theme-dark');
        }
      };

      // 初始移除 dark class
      removeDarkClass(document.documentElement);

      // 监听 classList 变化
      const classObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
            const target = mutation.target as HTMLElement;
            removeDarkClass(target);
          }
        });
      });

      // 开始监听 document.documentElement 的 class 属性变化
      classObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class'],
      });

      // 等待 DOM 加载完成后再监听 body
      const setupBodyObserver = () => {
        if (document.body) {
          removeDarkClass(document.body);
          classObserver.observe(document.body, {
            attributes: true,
            attributeFilter: ['class'],
          });
        }
      };

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupBodyObserver);
      } else {
        setupBodyObserver();
      }

      const meta = document.createElement('meta');
      meta.name = 'color-scheme';
      meta.content = 'light';

      // 等待 head 元素创建后再添加 meta 标签
      if (document.head) {
        document.head.appendChild(meta);
      } else {
        const metaObserver = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
              mutation.addedNodes.forEach((node) => {
                if (node instanceof HTMLHeadElement) {
                  node.appendChild(meta);
                  metaObserver.disconnect();
                }
              });
            }
          });
        });

        metaObserver.observe(document.documentElement, {
          childList: true,
        });
      }
    }
  },
});
