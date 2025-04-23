import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { formatHtml } from 'e2e/__supports/string-utils';

test('Navigating to /en/marital-status renders the english marital-status page', async ({ page }) => {
  await page.goto('/en/marital-status');

  expect(await formatHtml(await page.locator('main').innerHTML())).toMatchSnapshot();
});

test('Navigating to /fr/etat-civil renders the french marital-status page', async ({ page }) => {
  await page.goto('/fr/etat-civil');

  expect(await formatHtml(await page.locator('main').innerHTML())).toMatchSnapshot();
});

test('/en/marital-status passes a11y checks', async ({ page }) => {
  await page.goto('/en/marital-status');
  await page.locator('main').waitFor();

  const accessibilityScanResults = await new AxeBuilder({ page }).include('main').analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
});

test('/fr/etat-civil passes a11y checks', async ({ page }) => {
  await page.goto('/fr/etat-civil');
  await page.locator('main').waitFor();

  const accessibilityScanResults = await new AxeBuilder({ page }).include('main').analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
});
