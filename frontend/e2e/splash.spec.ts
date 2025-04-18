import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('Navigating to / renders the language chooser page', async ({ page }) => {
  await page.goto('/');

  expect(await page.locator('main').innerHTML()).toMatchSnapshot();
});

test('passes a11y checks', async ({ page }) => {
  await page.goto('/');
  await page.locator('main').waitFor();

  const accessibilityScanResults = await new AxeBuilder({ page }).include('main').analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
});
