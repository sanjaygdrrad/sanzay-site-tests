const { test, expect } = require('@playwright/test');
const { SECTIONS, mockVisits, openMenuIfMobile } = require('./helpers');

test.beforeEach(async ({ page }) => { await mockVisits(page); });

for (const id of SECTIONS) {
  test(`menu link reaches #${id}`, async ({ page }) => {
    await page.goto('/');
    await openMenuIfMobile(page);
    await page.locator(`#nav-menu a[href="#${id}"]`).click();
    await expect(page.locator(`#${id}`)).toBeInViewport({ ratio: 0.05 });
  });
}

test('phone menu opens and closes', async ({ page }) => {
  await page.goto('/');
  const toggle = page.locator('.nav__toggle');
  test.skip(!(await toggle.isVisible()), 'Desktop layout has no menu button');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await toggle.click();
  await expect(page.locator('#nav-menu')).toBeVisible();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await page.locator('#nav-menu a[href="#writing"]').click();   // choosing a link closes the menu
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
});
