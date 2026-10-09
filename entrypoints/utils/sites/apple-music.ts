/**
 * Apple Music（music.apple.com）按专辑封面取色决定页面明暗：
 * 封面偏暗时给 .app-container 加 is-dark-theme、详情头部加 --dark-layout，
 * 并把封面主色写进内联变量 --joe-color / --opaqueShelfBG-blended-plusD 作为背景。
 * 这与 prefers-color-scheme 无关，且不在 html/body 上，通用逻辑覆盖不到，单独处理。
 */
const HOSTNAME = 'music.apple.com';
const STYLE_ID = '__always-light-mode-apple-music__';
const MARKER = 'alm-forced-light';

const CLASS_SWAPS: [dark: string, light: string][] = [
  ['is-dark-theme', 'is-light-theme'],
  ['container-detail-header--dark-layout', 'container-detail-header--light-layout'],
];

// 封面取色的背景变量改回浅色主题默认值；!important 才能压过内联 style
const STYLE = `
  .app-container.${MARKER} {
    --joe-color: var(--pageBG) !important;
    --opaqueShelfBG-blended-plusD: var(--opaqueShelfBG) !important;
  }
`;

interface SwapEdit {
  element: Element;
  dark: string;
  light: string;
}

const swapEdits: SwapEdit[] = [];
let observer: MutationObserver | null = null;

const forceLight = (element: Element) => {
  for (const [dark, light] of CLASS_SWAPS) {
    if (!element.classList.contains(dark)) continue;
    element.classList.replace(dark, light);
    swapEdits.push({ element, dark, light });
    if (element.classList.contains('app-container')) element.classList.add(MARKER);
  }
};

const scan = () => {
  for (const [dark] of CLASS_SWAPS) {
    document.querySelectorAll(`.${dark}`).forEach(forceLight);
  }
};

export const setupAppleMusicFix = () => {
  if (location.hostname !== HOSTNAME || observer) return;

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = STYLE;
  (document.head || document.documentElement).appendChild(style);

  // SPA 切换专辑时 Svelte 会重新切换主题 class，持续监听
  observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'attributes') {
        forceLight(mutation.target as Element);
      } else {
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof Element)) return;
          forceLight(node);
          for (const [dark] of CLASS_SWAPS) {
            node.querySelectorAll(`.${dark}`).forEach(forceLight);
          }
        });
      }
    }
  });
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
    childList: true,
    subtree: true,
  });
  scan();
};

/** 断开监听并还原（只还原仍处于改写后状态的 class） */
export const teardownAppleMusicFix = () => {
  if (!observer) return;
  observer.disconnect();
  observer = null;

  for (const { element, dark, light } of swapEdits) {
    if (element.classList.contains(light)) element.classList.replace(light, dark);
    element.classList.remove(MARKER);
  }
  swapEdits.length = 0;
  document.getElementById(STYLE_ID)?.remove();
};
