import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { seedSessionData } from 'e2e/__supports/session-supports';

const stagedSession = {
  estimator: {
    maritalStatus: 'single-divorced-separated-or-widowed',
  },
  formFieldValues: [],
};

test('Navigating to /en/income renders the english income page', async ({ page }) => {
  await seedSessionData(page, stagedSession);

  await page.goto('/en/income');

  expect(await page.locator('main').innerHTML()).toMatchSnapshot();
});

test('Navigating to /fr/revenus renders the french income page', async ({ page }) => {
  await seedSessionData(page, stagedSession);
  await page.goto('/fr/revenus');

  expect(await page.locator('main').innerHTML()).toMatchSnapshot();
});

test('/en/income passes a11y checks', async ({ page }) => {
  await seedSessionData(page, stagedSession);
  await page.goto('/en/income');
  await page.locator('main').waitFor();

  const accessibilityScanResults = await new AxeBuilder({ page }).include('main').analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
});

test('/fr/revenus passes a11y checks', async ({ page }) => {
  await seedSessionData(page, stagedSession);
  await page.goto('/fr/revenus');
  await page.locator('main').waitFor();

  const accessibilityScanResults = await new AxeBuilder({ page }).include('main').analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
});
