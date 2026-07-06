import { test as base, chromium, type BrowserContext, type Page, type Worker } from '@playwright/test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const EXT_PATH = path.resolve(HERE, '../../.output/chrome-mv3');
const FIXTURES_DIR = path.resolve(HERE, 'fixtures');

interface ExtensionFixtures {
  context: BrowserContext;
  serviceWorker: Worker;
  extensionId: string;
}

/**
 * 带扩展的持久化浏览器上下文。
 * 系统偏好强制为深色（--force-dark-mode + colorScheme: dark），
 * 这样"暗色规则被中和"才是可观测的行为。
 */
export const test = base.extend<ExtensionFixtures>({
  // eslint-disable-next-line no-empty-pattern
  context: async ({}, use) => {
    const profile = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'alm-e2e-'));
    const context = await chromium.launchPersistentContext(profile, {
      channel: 'chromium',
      colorScheme: 'dark',
      args: [
        `--disable-extensions-except=${EXT_PATH}`,
        `--load-extension=${EXT_PATH}`,
        '--force-dark-mode',
      ],
    });
    await use(context);
    await context.close();
    await fs.promises.rm(profile, { recursive: true, force: true });
  },

  serviceWorker: async ({ context }, use) => {
    let [sw] = context.serviceWorkers();
    if (!sw) sw = await context.waitForEvent('serviceworker', { timeout: 15000 });
    // 等 background 完成内容脚本注册
    await sw.evaluate(async () => {
      for (let i = 0; i < 50; i++) {
        const scripts = await chrome.scripting.getRegisteredContentScripts();
        if (scripts.length > 0) return;
        await new Promise((r) => setTimeout(r, 100));
      }
      throw new Error('content scripts were never registered');
    });
    await use(sw);
  },

  extensionId: async ({ serviceWorker }, use) => {
    await use(new URL(serviceWorker.url()).hostname);
  },
});

export const expect = test.expect;

/** 把本地 fixture 文件挂到一个可注入内容脚本的 http URL 上（无需真实服务器） */
export const serveFixture = async (page: Page, fixtureFile: string) => {
  const body = await fs.promises.readFile(path.join(FIXTURES_DIR, fixtureFile), 'utf8');
  const url = `http://alm-e2e.test/${fixtureFile}`;
  await page.route(url, (route) => route.fulfill({ contentType: 'text/html', body }));
  return url;
};

/** dark-page.html 会把自检结果写进 #results，等待并解析 */
export const readResults = async (page: Page) => {
  await page.waitForFunction(() => (document.getElementById('results')?.textContent ?? '').length > 0);
  const text = await page.textContent('#results');
  return JSON.parse((text ?? '').replace('RESULTS:', ''));
};
