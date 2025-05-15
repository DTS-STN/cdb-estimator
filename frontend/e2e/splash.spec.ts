import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

import { formatHtml } from './__supports/string-utils';
import { PlaywrightBasePage } from './models/playwright-base-page';

test('Navigating to / renders the language chooser page', async ({ page }) => {
  const splashPage = new PlaywrightBasePage(page);

  await page.goto('/');
  await splashPage.isLoaded(/\/$/, 'en', /Language selection/);

  expect(await formatHtml(await page.locator('main').innerHTML())).toMatchSnapshot();
});

test('passes a11y checks', async ({ page }) => {
  const splashPage = new PlaywrightBasePage(page);

  await page.goto('/');
  await splashPage.isLoaded(/\/$/, 'en', /Language selection/);

  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
});
