export const addLightModeStyle = () => {
  const style = document.createElement('style');
  style.textContent = `
    :root, :host, html, body {
      color-scheme: light;
    }
  `;
  document.head.appendChild(style);
};
