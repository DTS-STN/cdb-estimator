import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { seedSessionData } from 'e2e/__supports/session-supports';

const stagedSession = {
  estimator: {
    maritalStatus: 'single-divorced-separated-or-widowed',
    income: {
      kind: 'single',
      individualIncome: {
        netIncome: 123,
        workingIncome: 2,
        claimedIncome: 3,
        claimedRepayment: 4,
      },
    },
  },
  formFieldValues: [
    ['income:individual-net-income', '123'],
    ['income:individual-working-income', '2'],
    ['income:individual-claimed-income', '3'],
    ['income:individual-claimed-repayment', '4'],
    ['income:action', 'next'],
  ],
};

test('Navigating to /en/results renders the english results page', async ({ page }) => {
  await seedSessionData(page, stagedSession);

  await page.goto('/en/results');

  expect(await page.locator('main').innerHTML()).toMatchSnapshot();
});

test('Navigating to /fr/resultats renders the french results page', async ({ page }) => {
  await seedSessionData(page, stagedSession);
  await page.goto('/fr/resultats');

  expect(await page.locator('main').innerHTML()).toMatchSnapshot();
});

test('/en/results passes a11y checks', async ({ page }) => {
  await seedSessionData(page, stagedSession);
  await page.goto('/en/results');
  await page.locator('main').waitFor();

  const accessibilityScanResults = await new AxeBuilder({ page }).include('main').analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
});

test('/fr/resultats passes a11y checks', async ({ page }) => {
  await seedSessionData(page, stagedSession);
  await page.goto('/fr/resultats');
  await page.locator('main').waitFor();

  const accessibilityScanResults = await new AxeBuilder({ page }).include('main').analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
});
