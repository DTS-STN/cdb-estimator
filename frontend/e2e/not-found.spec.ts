import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('Navigating to /foo renders the bilingual 404 page', async ({ page }) => {
  await page.goto('/foo');

  expect(await page.locator('header').innerHTML()).toMatchSnapshot();
  expect(await page.locator('main').innerHTML()).toMatchSnapshot();
  expect(await page.locator('footer').innerHTML()).toMatchSnapshot();
});

test('Navigating to /en/foo renders the unilingual 404 page', async ({ page }) => {
  await page.goto('/en/foo');

  expect(await page.locator('header').innerHTML()).toMatchSnapshot();
  expect(await page.locator('main').innerHTML()).toMatchSnapshot();
  expect(await page.locator('footer').innerHTML()).toMatchSnapshot();
});

test('Bilingual 404 page passes a11y checks', async ({ page }) => {
  await page.goto('/foo');
  await page.locator('main').waitFor();

  const accessibilityScanResults = await new AxeBuilder({ page }).include('main').analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
});

test('Unilingual 404 page passes a11y checks', async ({ page }) => {
  await page.goto('/en/foo');
  await page.locator('main').waitFor();

  const accessibilityScanResults = await new AxeBuilder({ page }).include('main').analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
});
