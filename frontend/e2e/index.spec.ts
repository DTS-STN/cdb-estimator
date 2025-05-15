import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

import { formatHtml } from './__supports/string-utils';
import { PlaywrightEstimatorPage } from './models/playwright-estimator-page';

test('Navigating to /en renders the english dashboard page', async ({ page }) => {
  const estimator = new PlaywrightEstimatorPage(page);

  await page.goto('/en');
  await estimator.isLoaded('index');

  expect(await formatHtml(await page.locator('main').innerHTML())).toMatchSnapshot();
});

test('Navigating to /fr renders the french dashboard page', async ({ page }) => {
  const estimator = new PlaywrightEstimatorPage(page);

  await page.goto('/fr');
  await estimator.isLoaded('index', 'fr');

  expect(await formatHtml(await page.locator('main').innerHTML())).toMatchSnapshot();
});

test('/en passes a11y checks', async ({ page }) => {
  const estimator = new PlaywrightEstimatorPage(page);

  await page.goto('/en');
  await estimator.isLoaded('index');

  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
});

test('/fr passes a11y checks', async ({ page }) => {
  const estimator = new PlaywrightEstimatorPage(page);

  await page.goto('/fr');
  await estimator.isLoaded('index', 'fr');

  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
});
