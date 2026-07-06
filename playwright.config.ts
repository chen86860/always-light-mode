import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  // 每个测试用独立的持久化 profile，串行跑最稳
  workers: 1,
  fullyParallel: false,
  timeout: 60_000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
});
