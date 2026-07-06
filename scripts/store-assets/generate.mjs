// 生成 Chrome Web Store 素材：pnpm store:assets
// 输出到 assets/store/：两张 1280x800 截图 + 一张 440x280 小推广图
import { chromium } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(HERE, '../../assets/store');
fs.mkdirSync(OUT_DIR, { recursive: true });

const browser = await chromium.launch({ channel: 'chromium' });
// CWS 要求截图精确 1280x800、小推广图 440x280，scale 必须为 1
const page = await browser.newPage({ deviceScaleFactor: 1, viewport: { width: 1400, height: 900 } });
await page.goto(`file://${path.join(HERE, 'template.html')}`);

const shots = [
  ['#shot1', 'screenshot-1-hero.png'],
  ['#shot2', 'screenshot-2-controls.png'],
  ['#promo', 'promo-small-440x280.png'],
];

for (const [selector, file] of shots) {
  await page.locator(selector).screenshot({ path: path.join(OUT_DIR, file) });
  console.log('generated', file);
}

await browser.close();
