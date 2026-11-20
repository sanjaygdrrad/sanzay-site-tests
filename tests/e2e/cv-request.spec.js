// The CV request form. The server is mocked, so no real email is ever sent.
const { test, expect } = require('@playwright/test');
const { mockVisits, mockCvRequest } = require('./helpers');

test.beforeEach(async ({ page }) => { await mockVisits(page); });

async function openDialog(page) {
  await page.goto('/');
  await page.locator('#contact [data-open-cv]').click();
  await expect(page.locator('#cv-dialog')).toBeVisible();
}

test('asks for a name first', async ({ page }) => {
  const bodies = await mockCvRequest(page);
  await openDialog(page);
  await page.locator('#cv-form [type=submit]').click();
  await expect(page.locator('.cvd__msg')).toHaveText('Please enter your name.');
  expect(bodies).toHaveLength(0);
});

test('rejects an invalid email address', async ({ page }) => {
  await mockCvRequest(page);
  await openDialog(page);
  await page.fill('#cv-form [name=name]', 'Test Visitor');
  await page.fill('#cv-form [name=email]', 'not-an-email');
  await page.locator('#cv-form [type=submit]').click();
  await expect(page.locator('.cvd__msg')).toHaveText('Please enter a valid email address.');
});

test('requires the consent box', async ({ page }) => {
  await mockCvRequest(page);
  await openDialog(page);
  await page.fill('#cv-form [name=name]', 'Test Visitor');
  await page.fill('#cv-form [name=email]', 'test@example.com');
  await page.locator('#cv-form [type=submit]').click();
  await expect(page.locator('.cvd__msg')).toHaveText('Please tick the consent box.');
});

test('sends the request and shows the "check your inbox" step', async ({ page }) => {
  const bodies = await mockCvRequest(page);
  await openDialog(page);
  await page.fill('#cv-form [name=name]', 'Test Visitor');
  await page.fill('#cv-form [name=email]', 'test@example.com');
  await page.fill('#cv-form [name=organisation]', 'Example Org');
  await page.selectOption('#cv-form [name=purpose]', 'Hiring');
  await page.check('#cv-form [name=consent]');
  await page.locator('#cv-form [type=submit]').click();
  await expect(page.locator('[data-step=done]')).toBeVisible();
  await expect(page.locator('.cvd__done')).toContainText('test@example.com');
  expect(bodies).toHaveLength(1);
  expect(bodies[0]).toContain('Test Visitor');
  expect(bodies[0]).toMatch(/name="hp_x7"\r\n\r\n\r\n/);   // the bot trap stays empty for real people
  expect(bodies[0]).toMatch(/name="ts"\r\n\r\n\d{13}/);    // the timing field is filled in
});

test('shows the server\'s error message when sending fails', async ({ page }) => {
  await mockCvRequest(page, { ok: false, message: 'Too many requests. Please try again later.' });
  await openDialog(page);
  await page.fill('#cv-form [name=name]', 'Test Visitor');
  await page.fill('#cv-form [name=email]', 'test@example.com');
  await page.check('#cv-form [name=consent]');
  await page.locator('#cv-form [type=submit]').click();
  await expect(page.locator('.cvd__msg')).toHaveText('Too many requests. Please try again later.');
  await expect(page.locator('[data-step=form]')).toBeVisible();
});

test('the bot trap is hidden from people', async ({ page }) => {
  await openDialog(page);
  await expect(page.locator('#cv-form [name=hp_x7]')).not.toBeInViewport();
});
