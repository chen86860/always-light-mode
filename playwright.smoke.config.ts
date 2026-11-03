import { defineConfig } from '@playwright/test';

/** 真实站点冒烟测试（依赖外网，不进常规 CI），见 tests/smoke/ 与 .github/workflows/smoke.yml */
export default defineConfig({
  testDir: './tests/smoke',
  workers: 4,
  fullyParallel: true,
  timeout: 120_000,
  // 真实网络有抖动：失败重跑一次，两次都缩水才报
  retries: 1,
  reporter: process.env.CI ? [['github'], ['list'], ['html', { open: 'never' }]] : 'list',
});
