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

interface ClassEdit {
  element: HTMLElement;
  token: string;
}
interface AttrEdit {
  element: HTMLElement;
  attr: string;
  original: string;
  rewritten: string;
}

const classEdits: ClassEdit[] = [];
const attrEdits: AttrEdit[] = [];
const styleEdits: { element: HTMLElement; original: string }[] = [];

export const forceLightTheme = (element: HTMLElement) => {
  if (!element) return;

  for (const cls of DARK_CLASSES) {
    // 先判断再移除，避免无意义的 attribute 变更触发页面自己的观察器
    if (element.classList?.contains(cls)) {
      element.classList.remove(cls);
      classEdits.push({ element, token: cls });
    }
  }

  for (const attr of THEME_ATTRIBUTES) {
    const value = element.getAttribute(attr);
    if (value && DARK_VALUE.test(value)) {
      const rewritten = value.replace(DARK_VALUE_REPLACE, 'light');
      element.setAttribute(attr, rewritten);
      attrEdits.push({ element, attr, original: value, rewritten });
    }
  }

  if (element.style?.colorScheme && /dark/i.test(element.style.colorScheme)) {
    styleEdits.push({ element, original: element.style.colorScheme });
    element.style.colorScheme = 'light';
  }
};

let themeObserver: MutationObserver | null = null;
let pendingBodySetup: (() => void) | null = null;

export const setupThemeObserver = () => {
  forceLightTheme(document.documentElement);

  themeObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'attributes') {
        forceLightTheme(mutation.target as HTMLElement);
      }
    }
  });

  const observe = (element: HTMLElement) => {
    themeObserver?.observe(element, {
      attributes: true,
      attributeFilter: ['class', 'style', ...THEME_ATTRIBUTES],
    });
  };

  observe(document.documentElement);

  // 等待 body 出现后再监听
  pendingBodySetup = () => {
    if (document.body) {
      forceLightTheme(document.body);
      observe(document.body);
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', pendingBodySetup, { once: true });
  } else {
    pendingBodySetup();
  }
};

/** 断开监听并还原所有主题标记（只还原仍处于我们改写后状态的值，避免覆盖页面后续变更） */
export const teardownThemeObserver = () => {
  if (pendingBodySetup) {
    document.removeEventListener('DOMContentLoaded', pendingBodySetup);
    pendingBodySetup = null;
  }
  themeObserver?.disconnect();
  themeObserver = null;

  for (const { element, token } of classEdits) {
    element.classList.add(token);
  }
  classEdits.length = 0;

  for (const { element, attr, original, rewritten } of attrEdits) {
    if (element.getAttribute(attr) === rewritten) {
      element.setAttribute(attr, original);
    }
  }
  attrEdits.length = 0;

  for (const { element, original } of styleEdits) {
    if (element.style.colorScheme === 'light') {
      element.style.colorScheme = original;
    }
  }
  styleEdits.length = 0;
};
