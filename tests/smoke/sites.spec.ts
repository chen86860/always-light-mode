import { test as base, expect, chromium, type BrowserContext, type Page } from '@playwright/test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITES } from './sites';

/**
 * 真实站点冒烟测试：同一页面分别在“无插件”和“有插件”的 Chromium 中打开（系统均为深色），
 * 有插件时页面文本大幅缩水（白屏、应用崩溃）即判失败——Stripe 那次就是这种表现，
 * 且错误被站点自己的 Sentry 吞掉，控制台里什么都没有，只能靠结果对比发现。
 */

const HERE = path.dirname(fileURLToPath(import.meta.url));
const EXT_PATH = path.resolve(HERE, '../../.output/chrome-mv3');

/** 基线文本少于此值（挑战页、地区拦截、加载失败）时无法判断，跳过 */
const MIN_BASELINE_CHARS = 200;
/**
 * 有插件时文本不足基线的这个比例，视为页面被弄坏。
 * 取得较低：白屏/崩溃时文本接近 0（Stripe 那次是 0），而 A/B 测试、按主题下发不同首页的站点
 * 两次内容本就不同（zed.dev 两个版本之比约 37%），阈值高了会误报。
 */
const MIN_RATIO = 0.2;
const SETTLE_MS = 5000;

const test = base.extend<object, { baseline: BrowserContext; withExt: BrowserContext }>({
  baseline: [
    async ({}, use) => {
      const browser = await chromium.launch({ channel: 'chromium', args: ['--force-dark-mode'] });
      const context = await browser.newContext({ colorScheme: 'dark' });
      await use(context);
      await browser.close();
    },
    { scope: 'worker' },
  ],
  withExt: [
    async ({}, use) => {
      const profile = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'alm-smoke-'));
      const context = await chromium.launchPersistentContext(profile, {
        channel: 'chromium',
        colorScheme: 'dark',
        args: [`--disable-extensions-except=${EXT_PATH}`, `--load-extension=${EXT_PATH}`, '--force-dark-mode'],
      });
      // 等 background 完成内容脚本注册，否则第一个站点可能在注册前加载
      let [sw] = context.serviceWorkers();
      if (!sw) sw = await context.waitForEvent('serviceworker', { timeout: 15000 });
      await sw.evaluate(async () => {
        for (let i = 0; i < 50; i++) {
          if ((await chrome.scripting.getRegisteredContentScripts()).length > 0) return;
          await new Promise((r) => setTimeout(r, 100));
        }
        throw new Error('content scripts were never registered');
      });
      await use(context);
      await context.close();
      await fs.promises.rm(profile, { recursive: true, force: true });
    },
    { scope: 'worker' },
  ],
});

interface Visit {
  chars: number;
  errors: string[];
}

const visit = async (context: BrowserContext, url: string): Promise<Visit> => {
  const page: Page = await context.newPage();
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  try {
    await page.goto(url, { waitUntil: 'load', timeout: 30_000 }).catch(() => {});
    await page.waitForTimeout(SETTLE_MS);
    const chars = await page
      .evaluate(() => (document.body?.innerText ?? '').replace(/\s+/g, ' ').trim().length)
      .catch(() => 0);
    return { chars, errors };
  } finally {
    await page.close();
  }
};

for (const url of SITES) {
  test(url, async ({ baseline, withExt }) => {
    const before = await visit(baseline, url);
    test.skip(before.chars < MIN_BASELINE_CHARS, `基线文本仅 ${before.chars} 字符（可能被拦截），无法判断`);

    const after = await visit(withExt, url);
    const ratio = after.chars / before.chars;

    // 插件引入的新 JS 异常只做记录，不判失败（站点自身的随机报错太多）
    const newErrors = after.errors.filter((e) => !before.errors.includes(e));
    test.info().annotations.push({
      type: 'result',
      description: `text ${before.chars} → ${after.chars} (${Math.round(ratio * 100)}%)${
        newErrors.length ? `; new page errors: ${newErrors.slice(0, 3).join(' | ')}` : ''
      }`,
    });

    expect(ratio, `开启插件后页面文本从 ${before.chars} 降到 ${after.chars} 字符，疑似页面被弄坏`).toBeGreaterThanOrEqual(
      MIN_RATIO,
    );
  });
}
