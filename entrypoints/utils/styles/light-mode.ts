const STYLE_ID = '__always-light-mode__';

interface MetaEdit {
  meta: HTMLMetaElement;
  original: string;
}

const metaEdits: MetaEdit[] = [];

export const addLightModeStyle = () => {
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = STYLE_ID;
  // 用 * 覆盖到所有元素：组件级的 color-scheme: dark（配合 light-dark()）也要压住
  style.textContent = `
    :root, :host, * {
      color-scheme: light !important;
    }
  `;
  // document_start 时 <head> 可能尚未解析，退回挂到 documentElement
  (document.head || document.documentElement).appendChild(style);
};

export const removeLightModeStyle = () => {
  document.getElementById(STYLE_ID)?.remove();
};

/** 把 <meta name="color-scheme" content="dark"> 之类的声明改写为 light，可还原 */
export const forceLightMetaColorScheme = (meta: HTMLMetaElement) => {
  if (meta.name === 'color-scheme' && /dark/i.test(meta.content)) {
    metaEdits.push({ meta, original: meta.content });
    meta.content = 'light';
  }
};

export const restoreMetaColorScheme = () => {
  for (const { meta, original } of metaEdits) {
    if (meta.content === 'light') meta.content = original;
  }
  metaEdits.length = 0;
};
