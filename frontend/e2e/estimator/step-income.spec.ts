import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { seedSessionData } from 'e2e/__supports/session-supports';
import { formatHtml } from 'e2e/__supports/string-utils';
import { PlaywrightEstimatorPage } from 'e2e/models/PlaywrightEstimatorPage';

const stagedSession = {
  estimator: {
    maritalStatus: 'single-divorced-separated-or-widowed',
  },
  formFieldValues: [],
};

test('Navigating to /en/income renders the english income page', async ({ page }) => {
  const estimator = new PlaywrightEstimatorPage(page);
  const resp = await seedSessionData(page, stagedSession);
  expect(resp.status()).toBe(200);

  await page.goto('/en/income');
  await estimator.isLoaded('income');

  expect(await formatHtml(await page.locator('main').innerHTML())).toMatchSnapshot();
});

test('Navigating to /fr/revenus renders the french income page', async ({ page }) => {
  const estimator = new PlaywrightEstimatorPage(page);
  const resp = await seedSessionData(page, stagedSession);
  expect(resp.status()).toBe(200);

  await page.goto('/fr/revenus');
  await estimator.isLoaded('income', 'fr');

  expect(await formatHtml(await page.locator('main').innerHTML())).toMatchSnapshot();
});

test('/en/income passes a11y checks', async ({ page }) => {
  const estimator = new PlaywrightEstimatorPage(page);
  const resp = await seedSessionData(page, stagedSession);
  expect(resp.status()).toBe(200);

  await page.goto('/en/income');
  await estimator.isLoaded('income');

  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
});

test('/fr/revenus passes a11y checks', async ({ page }) => {
  const estimator = new PlaywrightEstimatorPage(page);
  const resp = await seedSessionData(page, stagedSession);
  expect(resp.status()).toBe(200);

  await page.goto('/fr/revenus');
  await estimator.isLoaded('income', 'fr');

  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
});
