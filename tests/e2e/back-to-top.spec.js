// Regression tests for two real bugs:
//  1. "Back to top" didn't scroll, because #top was the sticky menu bar (fixed 2026-11-20)
//  2. After the fix, the hidden "Skip to content" link popped up (fixed 2026-11-21)
const { test, expect } = require('@playwright/test');
const { mockVisits } = require('./helpers');

test.beforeEach(async ({ page }) => { await mockVisits(page); });

async function scrollToBottom(page) {
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(1000);
}

test('"Back to top" scrolls to the very top', async ({ page }) => {
  await page.goto('/');
  await scrollToBottom(page);
  await page.locator('footer a[href="#top"]').click();
  await expect.poll(() => page.evaluate(() => Math.round(window.scrollY)), { timeout: 5000 }).toBeLessThanOrEqual(2);
});

test('"Back to top" does not reveal the "Skip to content" link', async ({ page }) => {
  await page.goto('/');
  await scrollToBottom(page);
  await page.locator('footer a[href="#top"]').click();
  await expect.poll(() => page.evaluate(() => Math.round(window.scrollY)), { timeout: 5000 }).toBeLessThanOrEqual(2);
  await expect(page.locator('.skip')).not.toBeInViewport();
  await expect(page.locator('.hero__title')).toBeFocused();
  expect(new URL(page.url()).hash).toBe('');
});

test('the SB logo also scrolls to the top', async ({ page }) => {
  await page.goto('/');
  await scrollToBottom(page);
  await page.locator('a.brand').click();
  await expect.poll(() => page.evaluate(() => Math.round(window.scrollY)), { timeout: 5000 }).toBeLessThanOrEqual(2);
});
