import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test, expect, readResults } from './fixtures';

const FIXTURE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'fixtures/dark-page.html');

// 内置黑名单（stripe.com 及其子域）不注入任何脚本，页面保持原样
for (const url of ['https://stripe.com/alm-e2e', 'https://dashboard.stripe.com/login']) {
  test(`内置黑名单站点不注入：${new URL(url).hostname}`, async ({ context, serviceWorker }) => {
    void serviceWorker;
    const page = await context.newPage();
    const body = await fs.promises.readFile(FIXTURE, 'utf8');
    await page.route(url, (route) => route.fulfill({ contentType: 'text/html', body }));
    await page.goto(url);

    const results = await readResults(page);
    expect(results.mediaRuleColor).toBe('rgb(255, 0, 0)');
    expect(results.matchMediaDark).toBe(true);
    expect(results.storedTheme).toBe('dark');
  });
}
