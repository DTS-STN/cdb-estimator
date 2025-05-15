import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { formatHtml } from 'e2e/__supports/string-utils';
import { PlaywrightEstimatorPage } from 'e2e/models/playwright-estimator-page';

test('Navigating to /en/marital-status renders the english marital-status page', async ({ page }) => {
  const estimator = new PlaywrightEstimatorPage(page);
  await page.goto('/en/marital-status');
  await estimator.isLoaded('marital-status');

  expect(await formatHtml(await page.locator('main').innerHTML())).toMatchSnapshot();
});

test('Navigating to /fr/etat-civil renders the french marital-status page', async ({ page }) => {
  const estimator = new PlaywrightEstimatorPage(page);
  await page.goto('/fr/etat-civil');
  await estimator.isLoaded('marital-status', 'fr');

  expect(await formatHtml(await page.locator('main').innerHTML())).toMatchSnapshot();
});

test('/en/marital-status passes a11y checks', async ({ page }) => {
  const estimator = new PlaywrightEstimatorPage(page);
  await page.goto('/en/marital-status');
  await estimator.isLoaded('marital-status');

  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
});

test('/fr/etat-civil passes a11y checks', async ({ page }) => {
  const estimator = new PlaywrightEstimatorPage(page);
  await page.goto('/fr/etat-civil');
  await estimator.isLoaded('marital-status', 'fr');

  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
});
