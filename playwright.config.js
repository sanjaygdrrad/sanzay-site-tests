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
  workers: 1,          // one browser at a time: gentle on the live server and its firewall
  forbidOnly: !!process.env.CI,
  maxFailures: process.env.CI ? 10 : undefined,   // stop early if something is badly wrong
  globalTimeout: process.env.CI ? 8 * 60_000 : undefined,
  retries: 0,          // no automatic retries (each retry is extra traffic to the live site)
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list'], ['html', { open: 'never' }]],
  use: { baseURL, navigationTimeout: 20_000, trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'phone', use: { ...devices['Pixel 7'] } },
  ],
});
