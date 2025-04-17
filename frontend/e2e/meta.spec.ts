import { expect, test } from '@playwright/test';

const routesToCheck = ['/', '/en', '/en/marital-status', '/en/income', '/en/results'];

routesToCheck.forEach((route) => {
  test(`route '${route}' contains expected meta tags`, async ({ page }) => {
    await page.goto(route);
    await page.locator('html').waitFor();
    expect(await page.locator('meta').count()).toBeGreaterThan(0);
    expect(await page.locator('meta[name*="dcterms"]').count()).toBeGreaterThan(0);
  });
});
