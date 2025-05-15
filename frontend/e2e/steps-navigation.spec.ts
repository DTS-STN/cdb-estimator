import { expect, test } from '@playwright/test';

import { PlaywrightEstimatorPage } from './models/playwright-estimator-page';

test.describe('Skipping Step Navigation', () => {
  test('Navigating marital-status -> income routes to marital-status', async ({ page }) => {
    const estimator = new PlaywrightEstimatorPage(page);
    await page.goto('/en/marital-status');
    await estimator.isLoaded('marital-status');

    const incomeResponse = await page.goto('/en/income');
    const redirectedResponse = await incomeResponse?.request().redirectedFrom()?.response();

    expect(redirectedResponse?.status()).toBe(302);
    await estimator.isLoaded('marital-status');
  });

  test('Navigating marital-status -> results routes to marital-status', async ({ page }) => {
    const estimator = new PlaywrightEstimatorPage(page);
    await page.goto('/en/marital-status');
    await estimator.isLoaded('marital-status');

    const resultsResponse = await page.goto('/en/results');
    const redirectedResponse = await resultsResponse?.request().redirectedFrom()?.response();

    expect(redirectedResponse?.status()).toBe(302);
    await estimator.isLoaded('marital-status');
  });

  test('Navigating income -> results routes to income', async ({ page }) => {
    const estimator = new PlaywrightEstimatorPage(page);
    await page.goto('/en/marital-status');
    await estimator.isLoaded('marital-status');

    await page.getByRole('radio', { name: /single/i }).check();
    await page.getByRole('button', { name: /continue/i }).click();

    await estimator.isLoaded('income');

    const resultsResponse = await page.goto('/en/results');
    const redirectedResponse = await resultsResponse?.request().redirectedFrom()?.response();

    expect(redirectedResponse?.status()).toBe(302);
    await estimator.isLoaded('income');
  });

  test('Navigating dashboard -> income routes to marital-status', async ({ page }) => {
    const estimator = new PlaywrightEstimatorPage(page);
    await page.goto('/en');
    await estimator.isLoaded('index');

    const incomeResponse = await page.goto('/en/income');
    const redirectedResponse = await incomeResponse?.request().redirectedFrom()?.response();

    expect(redirectedResponse?.status()).toBe(302);
    await estimator.isLoaded('marital-status');
  });

  test('Navigating dashboard -> results routes to marital-status', async ({ page }) => {
    const estimator = new PlaywrightEstimatorPage(page);
    await page.goto('/en');
    await estimator.isLoaded('index');

    const resultsResponse = await page.goto('/en/results');
    const redirectedResponse = await resultsResponse?.request().redirectedFrom()?.response();

    expect(redirectedResponse?.status()).toBe(302);
    await estimator.isLoaded('marital-status');
  });
});
