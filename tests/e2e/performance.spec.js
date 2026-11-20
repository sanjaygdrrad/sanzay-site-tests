// Page-weight budget: keeps the site fast on slow mobile connections in Nepal.
const { test, expect } = require('@playwright/test');
const { mockVisits } = require('./helpers');

const BUDGET_KB = { document: 80, stylesheet: 50, script: 20, image: 150 };

test('stays within its page-weight budget', async ({ page, isMobile, baseURL }) => {
  test.skip(isMobile, 'Measured once, on desktop');
  await mockVisits(page);
  const sizes = { document: 0, stylesheet: 0, script: 0, image: 0 };
  page.on('response', async (r) => {
    if (!r.url().startsWith(new URL(baseURL).origin)) return; // own files only, not Google Fonts
    const type = r.request().resourceType();
    if (type in sizes) sizes[type] += (await r.body().catch(() => Buffer.alloc(0))).length;
  });
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  for (const [type, limit] of Object.entries(BUDGET_KB)) {
    expect(Math.round(sizes[type] / 1024), `${type} KB (limit ${limit})`).toBeLessThanOrEqual(limit);
  }
});

test('first paint happens quickly', async ({ page, isMobile }) => {
  test.skip(isMobile, 'Measured once, on desktop');
  await mockVisits(page);
  await page.goto('/');
  const fcp = await page.evaluate(() => performance.getEntriesByName('first-contentful-paint')[0]?.startTime ?? 0);
  expect(fcp, 'first contentful paint (ms)').toBeLessThan(3000);   // measured over the internet, from GitHub's servers
});
