import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

import { formatHtml } from './__supports/string-utils';

test('Navigating to /en renders the english dashboard page', async ({ page }) => {
  await page.goto('/en');

  expect(await formatHtml(await page.locator('main').innerHTML())).toMatchSnapshot();
});

test('Navigating to /fr renders the french dashboard page', async ({ page }) => {
  await page.goto('/fr');

  expect(await formatHtml(await page.locator('main').innerHTML())).toMatchSnapshot();
});

test('/en passes a11y checks', async ({ page }) => {
  await page.goto('/en');
  await page.locator('main').waitFor();

  const accessibilityScanResults = await new AxeBuilder({ page }).include('main').analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
});

test('/fr passes a11y checks', async ({ page }) => {
  await page.goto('/fr');
  await page.locator('main').waitFor();

  const accessibilityScanResults = await new AxeBuilder({ page }).include('main').analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
});
