const STYLE_ID = '__always-light-mode__';

export const addLightModeStyle = () => {
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    :root, :host, html, body {
      color-scheme: light !important;
    }
  `;
  // document_start 时 <head> 可能尚未解析，退回挂到 documentElement
  (document.head || document.documentElement).appendChild(style);
};

/** 把 <meta name="color-scheme" content="dark"> 之类的声明改写为 light */
export const forceLightMetaColorScheme = (meta: HTMLMetaElement) => {
  if (meta.name === 'color-scheme' && /dark/i.test(meta.content)) {
    meta.content = 'light';
  }
};
