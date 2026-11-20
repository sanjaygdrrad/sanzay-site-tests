// @ts-check
const { defineConfig, devices } = require('@playwright/test');

// Runs against the live site. Point it elsewhere with BASE_URL, e.g. a local copy.
// The site's server endpoints (CV request, visitor counter) are mocked inside the tests,
// so running this suite never sends emails or changes the real visitor count.
const baseURL = process.env.BASE_URL || 'https://sanzay.com.np';

module.exports = defineConfig({
  testDir: 'tests/e2e',
  timeout: 30_000,
  fullyParallel: true,
  workers: process.env.CI ? 4 : undefined,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list'], ['html', { open: 'never' }]],
  use: { baseURL, trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'phone', use: { ...devices['Pixel 7'] } },
  ],
});
