import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

import { formatHtml } from './__supports/string-utils';
import { PlaywrightBasePage } from './models/playwright-base-page';

test('Navigating to /foo renders the bilingual 404 page', async ({ page }) => {
  const notFoundPage = new PlaywrightBasePage(page);

  const notFoundResponse = await page.goto('/foo');
  await notFoundPage.isLoaded(/\/foo$/, 'en', /We couldn't find that web page/);
  await notFoundPage.isLoaded(/\/foo$/, 'en', /Nous ne pouvons trouver cette page/);

  expect(notFoundResponse?.status()).toBe(404);
  expect(await formatHtml(await page.locator('header').innerHTML())).toMatchSnapshot();
  expect(await formatHtml(await page.locator('main').innerHTML())).toMatchSnapshot();
  expect(await formatHtml(await page.locator('footer').innerHTML())).toMatchSnapshot();
});

test('Navigating to /en/foo renders the unilingual 404 page', async ({ page }) => {
  const notFoundPage = new PlaywrightBasePage(page);

  const notFoundResponse = await page.goto('/en/foo');
  await notFoundPage.isLoaded(/\/en\/foo$/, 'en', /We couldn't find that web page/);

  expect(notFoundResponse?.status()).toBe(404);
  expect(await formatHtml(await page.locator('header').innerHTML())).toMatchSnapshot();
  expect(await formatHtml(await page.locator('main').innerHTML())).toMatchSnapshot();
  expect(await formatHtml(await page.locator('footer').innerHTML())).toMatchSnapshot();
});

test('Bilingual 404 page passes a11y checks', async ({ page }) => {
  const notFoundPage = new PlaywrightBasePage(page);

  await page.goto('/foo');
  await notFoundPage.isLoaded(/\/foo$/, 'en', /We couldn't find that web page/);
  await notFoundPage.isLoaded(/\/foo$/, 'en', /Nous ne pouvons trouver cette page/);

  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
});

test('Unilingual 404 page passes a11y checks', async ({ page }) => {
  const notFoundPage = new PlaywrightBasePage(page);

  await page.goto('/en/foo');
  await notFoundPage.isLoaded(/\/en\/foo$/, 'en', /We couldn't find that web page/);

  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
});
