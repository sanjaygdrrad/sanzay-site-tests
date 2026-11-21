// Shared helpers. Every test mocks the site's PHP endpoints, so the suite never
// sends real emails or changes the real visitor count, even when run against the live site.
const { test, expect } = require('@playwright/test');

const SECTIONS = ['story', 'engineer', 'changemaker', 'speaking', 'writing', 'recognition', 'contact'];

/** Mock /api/visit.php. Returns an object that records how the page called it. */
async function mockVisits(page, { visitors = 1234 } = {}) {
  const calls = [];
  await page.route('**/api/visit.php', async (route) => {
    calls.push(route.request().method());
    await route.fulfill({ json: { ok: true, visitors, today: 1, since: '2026-11-16', counted: route.request().method() === 'POST' } });
  });
  return calls;
}

/** Mock /api/cv-request.php. Returns the list of submitted form bodies. */
async function mockCvRequest(page, reply = { ok: true, message: 'Check your inbox at test@example.com for the download link.' }) {
  const bodies = [];
  await page.route('**/api/cv-request.php', async (route) => {
    bodies.push(route.request().postData() || '');
    await route.fulfill({ status: reply.ok ? 200 : 422, json: reply });
  });
  return bodies;
}

/** Open the menu on phones (no-op on desktop). */
async function openMenuIfMobile(page) {
  const toggle = page.locator('.nav__toggle');
  if (await toggle.isVisible()) await toggle.click();
}

/**
 * After every page load, make sure we got the real site and not the hosting firewall's
 * "One moment, please..." bot challenge, so failures say what actually happened.
 */
test.beforeEach(async ({ page }) => {
  page.on('load', async () => {
    const title = await page.title().catch(() => '');
    if (/one moment, please/i.test(title)) {
      test.info().annotations.push({ type: 'blocked', description: 'Host firewall challenge page received' });
    }
  });
});

test.afterEach(async ({ page }, info) => {
  if (info.status !== info.expectedStatus && /one moment, please/i.test(await page.title().catch(() => ''))) {
    info.annotations.push({ type: 'cause', description: 'The live site served its firewall challenge ("One moment, please...") instead of the page.' });
    throw new Error('Blocked by the host firewall: the live site returned its "One moment, please..." bot challenge instead of the page.');
  }
});

module.exports = { SECTIONS, mockVisits, mockCvRequest, openMenuIfMobile };
