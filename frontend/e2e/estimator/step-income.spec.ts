import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { seedSessionData } from 'e2e/__supports/session-supports';
import { formatHtml } from 'e2e/__supports/string-utils';

const stagedSession = {
  estimator: {
    maritalStatus: 'single-divorced-separated-or-widowed',
  },
  formFieldValues: [],
};

test('Navigating to /en/income renders the english income page', async ({ page }) => {
  await seedSessionData(page, stagedSession);

  await page.goto('/en/income');
  expect(page.url()).toContain('/en/income');

  expect(await formatHtml(await page.locator('main').innerHTML())).toMatchSnapshot();
});

test('Navigating to /fr/revenus renders the french income page', async ({ page }) => {
  await seedSessionData(page, stagedSession);
  await page.goto('/fr/revenus');
  expect(page.url()).toContain('/fr/revenus');
  expect(await formatHtml(await page.locator('main').innerHTML())).toMatchSnapshot();
});

test('/en/income passes a11y checks', async ({ page }) => {
  await seedSessionData(page, stagedSession);
  await page.goto('/en/income');
  expect(page.url()).toContain('/en/income');
  await page.locator('main').waitFor();

  const accessibilityScanResults = await new AxeBuilder({ page }).include('main').analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
});

test('/fr/revenus passes a11y checks', async ({ page }) => {
  await seedSessionData(page, stagedSession);
  await page.goto('/fr/revenus');
  expect(page.url()).toContain('/fr/revenus');
  await page.locator('main').waitFor();

  const accessibilityScanResults = await new AxeBuilder({ page }).include('main').analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
});
