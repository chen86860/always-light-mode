/**
 * OpenCode V2 文档（opencode.ai/v2/docs）只有暗色：:root 上无条件写死
 * color-scheme: dark 与一组深色变量，没有任何浅色主题可切换，通用逻辑无从下手，
 * 只能直接给出一套浅色变量。V1 文档（/docs，Starlight）走 data-theme，通用逻辑已覆盖。
 *
 * 用 :has() 把规则限定在 V2 页面：Astro ClientRouter 站内跳转不刷新页面，
 * V1/V2 之间来回切换时规则随页面结构自动生效/失效。
 */
const HOSTNAME = 'opencode.ai';
const STYLE_ID = '__always-light-mode-opencode__';
const V2 = ':root:has(link[href^="/v2/_astro/"])';

const STYLE = `
  ${V2} {
    --background: #ffffff !important;
    --foreground: #1a1a1a !important;
    --muted: #6b6b6b !important;
    --border: #e2e2e2 !important;
    --surface: #f6f6f6 !important;
    --surface-hover: #ededed !important;
    --link: #2563eb !important;
  }
  ${V2} .brand img {
    content: url(/v2/assets/logo-light.svg);
  }
  ${V2} .callout-tip {
    background: #ecfdf3 !important;
    border-color: #a6e3c0 !important;
  }
  ${V2} .callout-warning {
    background: #fff8eb !important;
    border-color: #f2d19b !important;
  }
  ${V2} .api-navigation-method-get, ${V2} .api-method-get { color: #1d4ed8 !important; }
  ${V2} .api-navigation-method-post, ${V2} .api-method-post,
  ${V2} .api-status-success { color: #15803d !important; }
  ${V2} .api-navigation-method-put, ${V2} .api-navigation-method-patch,
  ${V2} .api-method-put, ${V2} .api-method-patch,
  ${V2} .api-required, ${V2} .api-status { color: #b45309 !important; }
  ${V2} .api-navigation-method-delete, ${V2} .api-method-delete,
  ${V2} .api-deprecated { color: #dc2626 !important; }
  /* Shiki 的 span 颜色被站点用 !important 锁成 --shiki-dark，纯 CSS 拿不回内联的浅色值，
     代码块保留 github-dark 底色 */
  ${V2} .prose pre {
    background: #24292e !important;
    color: #e1e4e8 !important;
  }
`;

export const setupOpencodeFix = () => {
  if (location.hostname !== HOSTNAME || document.getElementById(STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = STYLE;
  // 挂在 <html> 下而非 <head>：ClientRouter 跳转会整体替换 <head> 的子节点
  document.documentElement.appendChild(style);
};

export const teardownOpencodeFix = () => {
  document.getElementById(STYLE_ID)?.remove();
};
