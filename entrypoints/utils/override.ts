export const override = () => {
  // 保存原始方法
  const originalMatchMedia = window.matchMedia;

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
};
