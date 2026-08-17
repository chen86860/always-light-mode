import { test, expect } from './fixtures';

const SITEMAP = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://alm-e2e.test/</loc></url>
</urlset>`;

const serialize = () =>
  new XMLSerializer().serializeToString(document.documentElement as unknown as Node);

test('XML 文档不被注入任何内容（文档树保持原样）', async ({ context, serviceWorker }) => {
  void serviceWorker;
  const page = await context.newPage();
  const url = 'http://alm-e2e.test/sitemap.xml';
  await page.route(url, (route) => route.fulfill({ contentType: 'application/xml', body: SITEMAP }));
  await page.goto(url);

  // Chrome 的 XML 查看器会把文档改写成带 #webkit-xml-viewer-source-xml 的展示页，
  // 原始文档树保存在其中，断言它没有被塞进任何东西
  const source = await page.evaluate(
    () => document.getElementById('webkit-xml-viewer-source-xml')?.innerHTML ?? '',
  );
  expect(source).toContain('<urlset');
  expect(source).not.toContain('__always-light-mode__');
  expect(source).not.toContain('color-scheme');
});

test('SVG / RSS 等 +xml 文档同样不被注入', async ({ context, serviceWorker }) => {
  void serviceWorker;
  const page = await context.newPage();
  const url = 'http://alm-e2e.test/logo.svg';
  await page.route(url, (route) =>
    route.fulfill({
      contentType: 'image/svg+xml',
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="10" height="10"/></svg>',
    }),
  );
  await page.goto(url);

  expect(await page.evaluate(serialize)).not.toContain('__always-light-mode__');
});

test('text/plain 这类被浏览器包装成 HTML 的内容仍然强制亮色', async ({
  context,
  serviceWorker,
}) => {
  void serviceWorker;
  const page = await context.newPage();
  const url = 'http://alm-e2e.test/robots.txt';
  await page.route(url, (route) =>
    route.fulfill({ contentType: 'text/plain', body: 'User-agent: *' }),
  );
  await page.goto(url);

  expect(await page.evaluate(() => !!document.getElementById('__always-light-mode__'))).toBe(true);
  expect(
    await page.evaluate(() => getComputedStyle(document.documentElement).colorScheme),
  ).toBe('light');
});
