import { test, expect, serveFixture, readResults } from './fixtures';

const RED = 'rgb(255, 0, 0)';
const GREEN = 'rgb(0, 128, 0)';

const targetColor = `() => getComputedStyle(document.getElementById('media-target')).color`;

test('开关切换无需刷新页面即可生效并可还原', async ({ context, serviceWorker }) => {
  const page = await context.newPage();
  const url = await serveFixture(page, 'dark-page.html');
  await page.goto(url);
  const results = await readResults(page);
  expect(results.mediaRuleColor).toBe(GREEN);

  // 打标记：后续断言页面从未刷新
  await page.evaluate(() => ((window as unknown as { __marker: number }).__marker = 42));

  // 关闭全局开关 → 页面无刷新回到暗色
  await serviceWorker.evaluate(() => chrome.storage.sync.set({ isLightModeEnabled: false }));
  await page.waitForFunction(`${targetColor}() === '${RED}'`);
  expect(await page.evaluate(() => document.documentElement.classList.contains('dark'))).toBe(true);
  expect(await page.evaluate(() => document.documentElement.getAttribute('data-theme'))).toBe('dark');
  expect(await page.evaluate(() => matchMedia('(prefers-color-scheme: dark)').matches)).toBe(true);

  // 重新开启 → 页面无刷新恢复浅色
  await serviceWorker.evaluate(() => chrome.storage.sync.set({ isLightModeEnabled: true }));
  await page.waitForFunction(`${targetColor}() === '${GREEN}'`);
  expect(await page.evaluate(() => document.documentElement.classList.contains('dark'))).toBe(false);

  // 全程未发生导航/刷新
  expect(await page.evaluate(() => (window as unknown as { __marker: number }).__marker)).toBe(42);
});

test('排除当前站点同样无刷新生效', async ({ context, serviceWorker }) => {
  const page = await context.newPage();
  const url = await serveFixture(page, 'dark-page.html');
  await page.goto(url);
  await readResults(page);

  await page.evaluate(() => ((window as unknown as { __marker: number }).__marker = 42));

  await serviceWorker.evaluate(() => chrome.storage.sync.set({ disabledSites: ['alm-e2e.test'] }));
  await page.waitForFunction(`${targetColor}() === '${RED}'`);

  await serviceWorker.evaluate(() => chrome.storage.sync.set({ disabledSites: [] }));
  await page.waitForFunction(`${targetColor}() === '${GREEN}'`);

  expect(await page.evaluate(() => (window as unknown as { __marker: number }).__marker)).toBe(42);
});
