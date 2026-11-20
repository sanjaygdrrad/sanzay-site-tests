// Automated accessibility scan (axe-core, WCAG 2.1 A/AA). Fails on serious or critical issues.
const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;
const { mockVisits } = require('./helpers');

test('homepage has no serious accessibility issues', async ({ page }) => {
  await mockVisits(page);
  await page.goto('/');
  await page.addStyleTag({ content: '*,*::before,*::after{transition:none!important;animation:none!important}.reveal{opacity:1!important;transform:none!important}' }); // scan the final look, not mid-animation
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  const serious = results.violations.filter((v) => ['serious', 'critical'].includes(v.impact));
  const summary = serious.map((v) => `${v.impact}: ${v.id} (${v.nodes.length}×) ${v.help}`);
  expect(summary, summary.join('\n')).toEqual([]);
});

test('the CV dialog is accessible when open', async ({ page }) => {
  await mockVisits(page);
  await page.goto('/');
  await page.locator('#contact [data-open-cv]').click();
  const results = await new AxeBuilder({ page }).include('#cv-dialog').withTags(['wcag2a', 'wcag2aa']).analyze();
  const serious = results.violations.filter((v) => ['serious', 'critical'].includes(v.impact));
  expect(serious.map((v) => v.id)).toEqual([]);
});
