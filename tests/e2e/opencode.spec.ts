import { test, expect } from './fixtures';

// 模拟 OpenCode 文档的结构：:root 无条件写死暗色变量，V2 通过 /v2/_astro/ 下的样式表识别
const page = (stylesheet: string) => `<!doctype html><html><head>
<link rel="stylesheet" href="${stylesheet}">
<style>
  :root { color-scheme: dark; --background: #090909; --foreground: #efefef; }
  body { background: var(--background); color: var(--foreground); }
  .callout-tip { background: #0b1b11; }
</style></head><body>
  <a class="brand" href="/v2/"><img src="/v2/assets/logo-dark.svg" alt="OpenCode"></a>
  <div class="callout-tip"></div>
</body></html>`;

const snapshot = () => ({
  bodyBg: getComputedStyle(document.body).backgroundColor,
  bodyColor: getComputedStyle(document.body).color,
  calloutBg: getComputedStyle(document.querySelector('.callout-tip')!).backgroundColor,
  logo: getComputedStyle(document.querySelector('.brand img')!).content,
});

test('OpenCode V2 文档套用浅色变量，关闭后还原；V1 文档不受影响', async ({ context, serviceWorker }) => {
  const tab = await context.newPage();
  await tab.route('https://opencode.ai/v2/assets/**', (route) =>
    route.fulfill({ contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg"/>' }),
  );
  await tab.route('https://opencode.ai/**/*.css', (route) => route.fulfill({ contentType: 'text/css', body: '' }));
  await tab.route('https://opencode.ai/v2/docs', (route) =>
    route.fulfill({ contentType: 'text/html', body: page('/v2/_astro/_..test.css') }),
  );
  await tab.route('https://opencode.ai/docs', (route) =>
    route.fulfill({ contentType: 'text/html', body: page('/_astro/test.css') }),
  );

  await tab.goto('https://opencode.ai/v2/docs');
  await tab.waitForFunction(() => document.getElementById('__always-light-mode-opencode__'));
  const light = await tab.evaluate(snapshot);
  expect(light.bodyBg).toBe('rgb(255, 255, 255)');
  expect(light.bodyColor).toBe('rgb(26, 26, 26)');
  expect(light.calloutBg).toBe('rgb(236, 253, 243)');
  expect(light.logo).toContain('/v2/assets/logo-light.svg');

  // 非 V2 页面：:has() 条件不成立，保持站点原样
  await tab.goto('https://opencode.ai/docs');
  await tab.waitForFunction(() => document.getElementById('__always-light-mode-opencode__'));
  expect((await tab.evaluate(snapshot)).bodyBg).toBe('rgb(9, 9, 9)');

  // 关闭开关 → 无刷新还原为站点原本的暗色
  await tab.goto('https://opencode.ai/v2/docs');
  await tab.waitForFunction(() => document.getElementById('__always-light-mode-opencode__'));
  await serviceWorker.evaluate(() => chrome.storage.sync.set({ isLightModeEnabled: false }));
  await tab.waitForFunction(() => !document.getElementById('__always-light-mode-opencode__'));
  expect((await tab.evaluate(snapshot)).bodyBg).toBe('rgb(9, 9, 9)');
});
