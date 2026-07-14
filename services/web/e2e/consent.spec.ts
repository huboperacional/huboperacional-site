import { test, expect } from '@playwright/test';

// Other specs run with a pre-seeded 'denied' choice (playwright.config) so the
// fixed banner never covers their UI. Here we want a fresh visitor, so start with
// an empty storage state and let the banner appear.
test.use({ storageState: { cookies: [], origins: [] } });

// The GA4 loader URL. Intercept it in every test so no real Google request is made.
const GTAG_GLOB = '**/www.googletagmanager.com/gtag/js**';
const BANNER = { name: /Consentimento de cookies/i };
const gaScript = 'script[src*="googletagmanager.com/gtag/js"]';

test.describe('cookie consent + GA4 gating', () => {
  test('banner shows on first visit and GA is NOT loaded before consent', async ({ page }) => {
    let gaRequested = false;
    await page.route(GTAG_GLOB, (route) => {
      gaRequested = true;
      return route.fulfill({ status: 200, contentType: 'application/javascript', body: '' });
    });
    await page.goto('/');

    await expect(page.getByRole('region', BANNER)).toBeVisible();
    await expect(page.locator(gaScript)).toHaveCount(0);
    expect(gaRequested).toBe(false);
  });

  test('accept loads GA, persists granted, and closes the banner', async ({ page }) => {
    await page.route(GTAG_GLOB, (route) =>
      route.fulfill({ status: 200, contentType: 'application/javascript', body: 'window.__gaLoaded=1;' }),
    );
    await page.goto('/');

    await page.getByRole('button', { name: 'Aceitar' }).click();

    await expect(page.getByRole('region', BANNER)).toHaveCount(0);
    await expect(page.locator(gaScript)).toHaveCount(1);
    expect(await page.evaluate(() => localStorage.getItem('hub_consent'))).toBe('granted');
  });

  test('reject persists denied and never loads GA', async ({ page }) => {
    let gaRequested = false;
    await page.route(GTAG_GLOB, (route) => {
      gaRequested = true;
      return route.fulfill({ status: 200, body: '' });
    });
    await page.goto('/');

    await page.getByRole('button', { name: 'Recusar' }).click();

    await expect(page.getByRole('region', BANNER)).toHaveCount(0);
    expect(await page.evaluate(() => localStorage.getItem('hub_consent'))).toBe('denied');
    await expect(page.locator(gaScript)).toHaveCount(0);
    expect(gaRequested).toBe(false);
  });

  test('choice persists across reload (banner does not reappear)', async ({ page }) => {
    await page.route(GTAG_GLOB, (route) => route.fulfill({ status: 200, body: '' }));
    await page.goto('/');
    await page.getByRole('button', { name: 'Recusar' }).click();
    await expect(page.getByRole('region', BANNER)).toHaveCount(0);

    await page.reload();
    await expect(page.getByRole('region', BANNER)).toHaveCount(0);
  });

  test('footer "Cookies" link reopens the banner after a choice', async ({ page }) => {
    await page.route(GTAG_GLOB, (route) => route.fulfill({ status: 200, body: '' }));
    await page.goto('/');
    await page.getByRole('button', { name: 'Recusar' }).click();
    await expect(page.getByRole('region', BANNER)).toHaveCount(0);

    await page.getByRole('button', { name: 'Cookies' }).click();
    await expect(page.getByRole('region', BANNER)).toBeVisible();
  });
});
