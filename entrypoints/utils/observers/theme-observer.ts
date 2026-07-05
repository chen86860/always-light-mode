const DARK_CLASSES = ['dark', 'theme-dark', 'dark-theme', 'dark-mode', 'darkmode', 'night', 'night-mode'];

// 常见框架/网站声明主题用的属性：
// data-theme（daisyUI 等）、data-color-mode（GitHub）、data-bs-theme（Bootstrap 5.3+）等
const THEME_ATTRIBUTES = [
  'data-theme',
  'data-color-mode',
  'data-color-scheme',
  'data-bs-theme',
  'data-mode',
  'data-scheme',
  'data-dark-mode',
  'theme',
  'color-scheme',
];

// 带 /g 的正则不能复用做 .test()（lastIndex 会残留），检测与替换分开
const DARK_VALUE = /dark|night/i;
const DARK_VALUE_REPLACE = /dark|night/gi;

export const forceLightTheme = (element: HTMLElement) => {
  if (!element) return;

  for (const cls of DARK_CLASSES) {
    // 先判断再移除，避免无意义的 attribute 变更触发页面自己的观察器
    if (element.classList?.contains(cls)) {
      element.classList.remove(cls);
    }
  }

  for (const attr of THEME_ATTRIBUTES) {
    const value = element.getAttribute(attr);
    if (value && DARK_VALUE.test(value)) {
      element.setAttribute(attr, value.replace(DARK_VALUE_REPLACE, 'light'));
    }
  }

  if (element.style?.colorScheme && /dark/i.test(element.style.colorScheme)) {
    element.style.colorScheme = 'light';
  }
};

export const setupThemeObserver = () => {
  forceLightTheme(document.documentElement);

  const themeObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'attributes') {
        forceLightTheme(mutation.target as HTMLElement);
      }
    }
  });

  const observe = (element: HTMLElement) => {
    themeObserver.observe(element, {
      attributes: true,
      attributeFilter: ['class', 'style', ...THEME_ATTRIBUTES],
    });
  };

  observe(document.documentElement);

  // 等待 body 出现后再监听
  const setupBodyObserver = () => {
    if (document.body) {
      forceLightTheme(document.body);
      observe(document.body);
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupBodyObserver);
  } else {
    setupBodyObserver();
  }

  return themeObserver;
};
