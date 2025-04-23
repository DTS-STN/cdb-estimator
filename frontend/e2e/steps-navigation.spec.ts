import { expect, test } from '@playwright/test';

test('Navigating marital-status -> income routes to marital-status', async ({ page }) => {
  const maritalStatusResponse = await page.goto('/en/marital-status');
  await page.goto('/en/income');

  expect(maritalStatusResponse?.status()).toBe(200);
  await expect(page).toHaveURL(/marital-status/);
});

test('Navigating marital-status -> results routes to marital-status', async ({ page }) => {
  const maritalStatusResponse = await page.goto('/en/marital-status');
  await page.goto('/en/results');

  expect(maritalStatusResponse?.status()).toBe(200);
  await expect(page).toHaveURL(/marital-status/);
});

test('Navigating income -> results routes to income', async ({ page }) => {
  await page.goto('/en/marital-status');
  await page.getByRole('radio', { name: /single/i }).check();
  await page.getByRole('button', { name: /continue/i }).click();

  await expect(page).toHaveURL(/income/);
  await page.goto('/en/results');

  await expect(page).toHaveURL(/income/);
});

test('Navigating dashboard -> income routes to marital-status', async ({ page }) => {
  const dashboardResponse = await page.goto('/en');
  await page.goto('/en/income');

  expect(dashboardResponse?.status()).toBe(200);
  await expect(page).toHaveURL(/marital-status/);
});

test('Navigating dashboard -> results routes to marital-status', async ({ page }) => {
  const dashboardResponse = await page.goto('/en');
  await page.goto('/en/results');

  expect(dashboardResponse?.status()).toBe(200);
  await expect(page).toHaveURL(/marital-status/);
});
