# sanzay.com.np · live site tests

[![Live site tests](https://github.com/sanjaygdrrad/sanzay-site-tests/actions/workflows/live-tests.yml/badge.svg)](https://github.com/sanjaygdrrad/sanzay-site-tests/actions/workflows/live-tests.yml)
&nbsp;[**→ Latest test report**](https://sanjaygdrrad.github.io/sanzay-site-tests/)

An end-to-end test suite for my personal site, **[sanzay.com.np](https://sanzay.com.np)**, written with [Playwright](https://playwright.dev).
It runs **every day against the live site**, on a **desktop browser and a phone**, and publishes its report publicly.

I lead software quality for a living, so my own site gets the same treatment as a production product. The same tests also gate every deployment: nothing goes live unless they pass.

## What's tested

| Area | What it protects |
|---|---|
| **Home** | Loads with no JavaScript errors or broken files; correct title, description and social preview; every section present; cache-busting on CSS/JS |
| **Navigation** | Every menu link reaches its section; the phone menu opens and closes |
| **Regression** | Two real bugs that once shipped: "Back to top" not scrolling (the anchor sat on a sticky header), and the hidden "Skip to content" link flashing after the fix |
| **CV request** | Form validation, the invisible bot trap, success and error paths |
| **Visitor counter** | "1 visitor" vs "N visitors", counted once per session, opt-out with `?nocount`, hidden if the service fails |
| **Content** | Featured articles, booking links, every new-tab link uses `rel="noopener"`, the interactive palette |
| **Accessibility** | [axe-core](https://github.com/dequelabs/axe-core) scan against WCAG 2.1 A/AA; fails on serious or critical issues |
| **Performance** | Page-weight budget (HTML ≤ 80 KB · CSS ≤ 50 KB · JS ≤ 20 KB · images ≤ 150 KB) and first paint under 3 s |

**36 tests × 2 devices = 72 runs.**

### Safe to run against production
The site has two small server features: a CV request that sends a verification email, and a visitor counter. The tests **intercept and mock** both, so running this suite never sends a real email and never changes the real visitor count.

### Found by the tests
On its first run, the accessibility scan caught award labels and small headings with **too little colour contrast** (as low as 3 : 1, where WCAG AA requires 4.5 : 1). They were fixed before the suite went public.

## Run it yourself

Requires [Node.js](https://nodejs.org) 18+.

```bash
npm install
npx playwright install chromium     # first time only
npm test                            # all tests, desktop + phone
npm run test:ui                     # watch every step in interactive mode
npm run report                      # open the HTML report
```

Run against another address (e.g. a local copy) with `BASE_URL`:

```bash
BASE_URL=http://localhost:4173 npm test
```

## How it runs
- `.github/workflows/live-tests.yml` runs daily at 02:17 UTC (08:02 in Nepal), on every push, and on demand.
- Tests run inside Playwright's official container image (no browser install), **one at a time and without retries**, to stay gentle on the live server and its firewall. A run takes about 2–3 minutes.
- The HTML report (screenshots and step-by-step traces for any failure) is published to GitHub Pages.

---

[sanzay.com.np](https://sanzay.com.np) · [GitHub profile](https://github.com/sanjaygdrrad) · MIT licence
