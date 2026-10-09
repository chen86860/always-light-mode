import { test, expect } from './fixtures';

// 模拟 Apple Music 封面取色的暗色结构：主题 class + 内联封面主色变量
const PAGE = `<!doctype html><html><head><style>
  :root { --pageBG: #fff; --opaqueShelfBG: #f2f2f2; }
  .app-container.is-dark-theme { color: rgb(255, 255, 255); }
  .app-container.is-light-theme { color: rgb(0, 0, 0); }
  .header-wrapper { background-color: var(--joe-color); }
  .section--alternate { background-color: var(--opaqueShelfBG-blended-plusD); }
</style></head><body>
  <div class="app-container is-dark-theme has-theme-override"
       style="--joe-color: #121212; --opaqueShelfBG-blended-plusD: rgb(8, 8, 8)">
    <div class="header-wrapper"><div class="container-detail-header container-detail-header--dark-layout"></div></div>
    <div class="section--alternate"></div>
  </div>
</body></html>`;

const WHITE = 'rgb(255, 255, 255)';

const snapshot = () => {
  const app = document.querySelector('.app-container')!;
  return {
    appDark: app.classList.contains('is-dark-theme'),
    appLight: app.classList.contains('is-light-theme'),
    headerDark: !!document.querySelector('.container-detail-header--dark-layout'),
    color: getComputedStyle(app).color,
    headerBg: getComputedStyle(document.querySelector('.header-wrapper')!).backgroundColor,
    shelfBg: getComputedStyle(document.querySelector('.section--alternate')!).backgroundColor,
  };
};

test('Apple Music 暗色封面专辑页保持浅色，SPA 重新切暗后再次纠正，关闭后可还原', async ({
  context,
  serviceWorker,
}) => {
  const page = await context.newPage();
  const url = 'https://music.apple.com/cn/album/nearness/6775907642';
  await page.route(url, (route) => route.fulfill({ contentType: 'text/html', body: PAGE }));
  await page.goto(url);

  await page.waitForFunction(() => document.querySelector('.app-container.is-light-theme'));
  expect(await page.evaluate(snapshot)).toEqual({
    appDark: false,
    appLight: true,
    headerDark: false,
    color: 'rgb(0, 0, 0)',
    headerBg: WHITE,
    shelfBg: 'rgb(242, 242, 242)',
  });

  // 模拟 SPA 切到另一张暗色专辑：框架重新切回暗色 class
  await page.evaluate(() => {
    const app = document.querySelector('.app-container')!;
    app.classList.remove('is-light-theme');
    app.classList.add('is-dark-theme');
  });
  await page.waitForFunction(() => document.querySelector('.app-container.is-light-theme'));

  // 关闭开关 → 无刷新还原为站点原本的暗色
  await serviceWorker.evaluate(() => chrome.storage.sync.set({ isLightModeEnabled: false }));
  await page.waitForFunction(() => document.querySelector('.app-container.is-dark-theme'));
  const restored = await page.evaluate(snapshot);
  expect(restored.headerDark).toBe(true);
  expect(restored.headerBg).toBe('rgb(18, 18, 18)');
});
