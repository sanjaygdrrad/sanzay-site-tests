const { test, expect } = require('@playwright/test');
const { SECTIONS, mockVisits } = require('./helpers');

test.beforeEach(async ({ page }) => { await mockVisits(page); });

test('loads without JavaScript errors or broken files', async ({ page }) => {
  const errors = [];
  const broken = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('response', (r) => { if (r.status() >= 400 && !r.url().includes('fonts.g')) broken.push(`${r.status()} ${r.url()}`); });
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  expect(errors, 'JavaScript errors').toEqual([]);
  expect(broken, 'Files that failed to load').toEqual([]);
});

test('has the right title, description and social preview', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Sanzay Bhandari/);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /Pokhara/);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /\/assets\/img\/og\.png$/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://sanzay.com.np/');
});

test('shows every section of the story', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toContainText('Engineering');
  for (const id of SECTIONS) await expect(page.locator(`#${id}`), `#${id}`).toHaveCount(1);
});

test('CSS and JS load with cache-busting version tags', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('link[rel="stylesheet"][href*="assets/css/style.css?v="]')).toHaveCount(1);
  await expect(page.locator('script[src*="assets/js/main.js?v="]')).toHaveCount(1);
});
