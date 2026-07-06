import { test, expect, serveFixture, readResults } from './fixtures';

const GREEN = 'rgb(0, 128, 0)';

test('在系统深色偏好下，暗色页面的所有暗色手段都被强制为浅色', async ({ context, serviceWorker }) => {
  void serviceWorker; // 确保注册完成
  const page = await context.newPage();
  const url = await serveFixture(page, 'dark-page.html');
  await page.goto(url);

  const results = await readResults(page);

  // matchMedia 补丁（含复合查询），media 字符串对页面保持原样
  expect(results.matchMediaDark).toBe(false);
  expect(results.matchMediaDarkCompound).toBe(false);
  expect(results.matchMediaLight).toBe(true);
  expect(results.matchMediaMediaString).toBe('(prefers-color-scheme: dark)');

  // 主题标记被移除/改写（含 token 级类名变体和不含 dark 字样的暗色主题名）
  expect(results.htmlHasDarkClass).toBe(false);
  expect(results.htmlHasTokenDarkClass).toBe(false);
  expect(results.dataTheme).toBe('light');
  expect(results.bodyDataTheme).toBe('light');

  // localStorage 里的主题偏好在读取时被改写为浅色，非主题 key 不受影响
  expect(results.storedTheme).toBe('light');
  expect(results.storedThemeProp).toBe('light');
  expect(results.storedDarkModeBool).toBe('false');
  expect(results.storedJsonMode).toBe('{"mode":"light"}');
  expect(results.storedNonTheme).toBe('darkwing');

  // 各层暗色 CSS 均不生效（绿色为浅色态样式）
  expect(results.mediaRuleColor).toBe(GREEN);
  expect(results.compoundMediaBg).toBe('rgba(0, 0, 0, 0)');
  expect(results.layerNestedDecoration).toBe(GREEN);
  expect(results.constructedOutline).toBe(GREEN);
  expect(results.shadowColor).toBe(GREEN);
  expect(results.colorScheme).toBe('light');
});
