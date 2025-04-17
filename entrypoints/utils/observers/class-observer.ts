export const removeDarkClass = (element: HTMLElement) => {
  if (element?.classList?.contains('dark')) {
    element.classList.remove('dark');
  }

  if (element?.classList?.contains('theme-dark')) {
    element.classList.remove('theme-dark');
  }
};

export const setupClassObserver = () => {
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

  return classObserver;
};
