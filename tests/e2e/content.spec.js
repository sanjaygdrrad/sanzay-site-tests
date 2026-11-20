const { test, expect } = require('@playwright/test');
const { mockVisits } = require('./helpers');

test.beforeEach(async ({ page }) => { await mockVisits(page); await page.goto('/'); });

test('features five Infopalette posts, each opening safely in a new tab', async ({ page }) => {
  const posts = page.locator('.posts li a');
  await expect(posts).toHaveCount(5);
  for (const a of await posts.all()) {
    await expect(a).toHaveAttribute('href', /^https:\/\/infopalette\.com\/[a-z0-9-]+\/$/);
    await expect(a).toHaveAttribute('target', '_blank');
    await expect(a).toHaveAttribute('rel', /noopener/);
  }
});

test('"Read Sanzay\'s posts" goes to his Infopalette profile', async ({ page }) => {
  await expect(page.getByRole('link', { name: /Read Sanzay's posts/ })).toHaveAttribute('href', 'https://infopalette.com/user/sbinfopalette/');
});

test('both "book" links point to his Microsoft Bookings page', async ({ page }) => {
  const links = page.locator('a[href*="bookings.cloud.microsoft/bookwithme"]');
  await expect(links).toHaveCount(2);
  for (const a of await links.all()) await expect(a).toHaveAttribute('target', '_blank');
});

test('contact routes use the right addresses', async ({ page }) => {
  await expect(page.locator('a[href="mailto:sbhandari@merodream.com"]').first()).toBeVisible();
  await expect(page.locator('a[href="mailto:sbhandari@meritnepal.org"]').first()).toBeAttached();
});

test('every link that opens a new tab uses rel="noopener"', async ({ page }) => {
  const unsafe = await page.locator('a[target="_blank"]:not([rel*="noopener"])').count();
  expect(unsafe).toBe(0);
});

test('hovering a featured post lights its paint well', async ({ page, isMobile }) => {
  test.skip(isMobile, 'Hover is a desktop interaction');
  await page.locator('.posts li').nth(4).hover();
  await expect(page.locator('.pl-well[data-theme="life"]')).toHaveClass(/is-lit/);
  await expect(page.locator('.pl-well[data-theme="tech"]')).not.toHaveClass(/is-lit/);
});
