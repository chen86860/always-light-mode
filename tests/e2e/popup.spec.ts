import { test, expect } from './fixtures';
import type { Page } from '@playwright/test';

/** popup 作为独立页面打开时伪造活动标签页，并屏蔽会干扰测试的 tabs API */
const openPopup = async (page: Page, extensionId: string) => {
  await page.addInitScript(() => {
    const fake = { id: 999, url: 'https://github.com/', active: true };
    const w = window as unknown as { __mailto: string | null; __reloaded: number[] };
    w.__mailto = null;
    w.__reloaded = [];
    chrome.tabs.query = () => Promise.resolve([fake] as never);
    chrome.tabs.reload = ((id: number) => {
      w.__reloaded.push(id);
      return Promise.resolve();
    }) as never;
    chrome.tabs.sendMessage = (() => Promise.reject(new Error('no receiver'))) as never;
    chrome.tabs.create = ((opts: { url: string }) => {
      w.__mailto = opts.url;
      return Promise.resolve({});
    }) as never;
    window.close = () => {};
  });
  await page.goto(`chrome-extension://${extensionId}/popup.html`);
  await page.waitForSelector('#site-host');
};

const readState = (page: Page) =>
  page.evaluate(() => ({
    globalChecked: (document.getElementById('global-toggle') as HTMLInputElement).checked,
    siteChecked: (document.getElementById('site-toggle') as HTMLInputElement).checked,
    siteHost: document.getElementById('site-host')?.textContent,
    siteLabel: document.getElementById('label-site')?.textContent,
    panelOff: document.getElementById('panel')?.classList.contains('off'),
  }));

test('开关状态机：总开关联动站点开关，排除站点写入存储', async ({ context, serviceWorker, extensionId }) => {
  const page = await context.newPage();
  await openPopup(page, extensionId);

  expect(await readState(page)).toMatchObject({
    globalChecked: true,
    siteChecked: true,
    siteHost: 'github.com',
    panelOff: false,
  });

  // 总开关关闭 → 站点开关也显示关闭
  await page.click('#global-toggle');
  await expect.poll(async () => (await readState(page)).siteChecked).toBe(false);
  expect((await readState(page)).panelOff).toBe(true);

  // 恢复 → 站点开关回到开启
  await page.click('#global-toggle');
  await expect.poll(async () => (await readState(page)).siteChecked).toBe(true);

  // 排除当前站点
  await page.click('#site-toggle');
  await expect.poll(async () => (await readState(page)).siteLabel).toContain('excluded');
  await expect
    .poll(() => serviceWorker.evaluate(() => chrome.storage.sync.get('disabledSites')))
    .toMatchObject({ disabledSites: ['github.com'] });

  // 恢复站点
  await page.click('#site-toggle');
  await expect
    .poll(() => serviceWorker.evaluate(() => chrome.storage.sync.get('disabledSites')))
    .toMatchObject({ disabledSites: [] });
});

test('邮件反馈：主题带插件名、版本与当前网站，正文为用户输入', async ({ context, serviceWorker, extensionId }) => {
  void serviceWorker;
  const page = await context.newPage();
  await openPopup(page, extensionId);

  await page.click('#feedback-toggle');
  expect(await page.evaluate(() => (document.getElementById('feedback-send') as HTMLButtonElement).disabled)).toBe(true);

  await page.fill('#feedback-text', '某站点仍是深色');
  expect(await page.evaluate(() => (document.getElementById('feedback-send') as HTMLButtonElement).disabled)).toBe(false);

  await page.click('#feedback-send');
  const mailto = await page.evaluate(() => (window as unknown as { __mailto: string | null }).__mailto);
  const decoded = decodeURIComponent(mailto ?? '');
  expect(decoded).toContain('mailto:support@emmmm.dev');
  expect(decoded).toMatch(/subject=\[Always Light Mode v[\d.]+\] Feedback - https:\/\/github\.com\//);
  expect(decoded).toContain('body=某站点仍是深色');
});

test('页面异常入口：底部展开后一键关闭本站、强制刷新并聚焦反馈', async ({ context, serviceWorker, extensionId }) => {
  const page = await context.newPage();
  await openPopup(page, extensionId);

  // 站点可关闭时，底部入口是「页面显示异常？」而不是「邮件反馈」
  expect(await page.textContent('#label-feedback')).toBe('Page looks broken?');
  expect(await page.evaluate(() => document.querySelector('.feedback')?.classList.contains('open'))).toBe(false);
  await page.click('#feedback-toggle');
  await page.click('#turn-off-site');

  await expect
    .poll(() => serviceWorker.evaluate(() => chrome.storage.sync.get('disabledSites')))
    .toMatchObject({ disabledSites: ['github.com'] });
  expect(await page.evaluate(() => (window as unknown as { __reloaded: number[] }).__reloaded)).toEqual([999]);
  expect(await readState(page)).toMatchObject({ siteChecked: false });
  expect(await page.isVisible('#turn-off-site')).toBe(false);
  expect(await page.textContent('#label-feedback')).toBe('Email feedback');
  expect(await page.evaluate(() => document.activeElement?.id)).toBe('feedback-text');
});
