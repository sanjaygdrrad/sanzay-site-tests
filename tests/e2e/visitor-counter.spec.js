// The footer visitor counter. The server is mocked, so the real count never changes.
const { test, expect } = require('@playwright/test');
const { mockVisits } = require('./helpers');

test('shows the number of visitors, without a "since" date', async ({ page }) => {
  await mockVisits(page, { visitors: 1234 });
  await page.goto('/');
  await expect(page.locator('#visits')).toBeVisible();
  await expect(page.locator('#visits-n')).toHaveText('1,234');
  await expect(page.locator('#visits-word')).toHaveText('visitors');
  await expect(page.locator('#visits')).not.toContainText('since');
});

test('says "1 visitor" in the singular', async ({ page }) => {
  await mockVisits(page, { visitors: 1 });
  await page.goto('/');
  await expect(page.locator('#visits-n')).toHaveText('1');
  await expect(page.locator('#visits-word')).toHaveText('visitor');
});

test('counts a visit once per browser session', async ({ page }) => {
  const calls = await mockVisits(page);
  await page.goto('/');
  await expect(page.locator('#visits')).toBeVisible();
  await page.reload();
  await expect(page.locator('#visits')).toBeVisible();
  expect(calls).toEqual(['POST', 'GET']);
});

test('?nocount=1 stops counting this browser', async ({ page }) => {
  const calls = await mockVisits(page);
  await page.goto('/?nocount=1');
  await expect(page.locator('#visits')).toBeVisible();
  await page.goto('/');
  await expect(page.locator('#visits')).toBeVisible();
  expect(calls).toEqual(['GET', 'GET']);
});

test('stays hidden if the counter is unavailable', async ({ page }) => {
  await page.route('**/api/visit.php', (route) => route.fulfill({ status: 500, body: 'error' }));
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await expect(page.locator('#visits')).toBeHidden();
});
