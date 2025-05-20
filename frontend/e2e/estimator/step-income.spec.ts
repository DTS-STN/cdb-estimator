import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';
import { seedSessionData } from 'e2e/__supports/session-supports';
import { formatHtml } from 'e2e/__supports/string-utils';
import { PlaywrightEstimatorPage } from 'e2e/models/playwright-estimator-page';

const singleStagedSession = {
  estimator: {
    maritalStatus: 'single-divorced-separated-or-widowed',
  },
  formFieldValues: [],
};

const marriedStagedSession = {
  estimator: {
    maritalStatus: 'married-or-common-law',
  },
  formFieldValues: [],
};

const singleCurrencyFieldNames = [
  'individual-net-income',
  'individual-working-income',
  'individual-claimed-income',
  'individual-claimed-repayment',
];

const marriedCurrencyFieldNames = [
  ...singleCurrencyFieldNames,
  'partner-net-income',
  'partner-working-income',
  'partner-claimed-income',
  'partner-claimed-repayment',
];

/* NOTE: currency fields selectively add inputmode="numeric" after hydration based off the browser type because
 * certain versions of ios devices don't render an adequate numeric input pad for decimal inputs.
 * To avoid inconsistencies during testing, we need to wait for the attribute to appear before checking against the snapshot.
 */
async function waitForCurrencyFields(page: Page, fields: string[]) {
  const selector = fields.map((name) => `input[name="${name}"]`).join(',');

  await page.waitForFunction(
    ({ sel, expectedCount }) => {
      const targetInputs = [...document.querySelectorAll(sel)];
      return targetInputs.length === expectedCount && targetInputs.every((el) => el.getAttribute('inputmode') === 'numeric');
    },
    {
      sel: selector,
      expectedCount: fields.length,
    },
  );
}

test('Navigating to /en/income renders the english income page (single) and passes a11y checks', async ({ page }) => {
  const estimator = new PlaywrightEstimatorPage(page);
  const resp = await seedSessionData(page, singleStagedSession);
  expect(resp.status()).toBe(200);

  await page.goto('/en/income');
  await estimator.isLoaded('income');

  await waitForCurrencyFields(page, singleCurrencyFieldNames);

  expect(await formatHtml(await page.locator('main').innerHTML())).toMatchSnapshot();
  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
});

test('Navigating to /en/income renders the english income page (married) and passes a11y checks', async ({ page }) => {
  const estimator = new PlaywrightEstimatorPage(page);
  const resp = await seedSessionData(page, marriedStagedSession);
  expect(resp.status()).toBe(200);

  await page.goto('/en/income');
  await estimator.isLoaded('income');

  await waitForCurrencyFields(page, marriedCurrencyFieldNames);

  expect(await formatHtml(await page.locator('main').innerHTML())).toMatchSnapshot();
  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
});

test('Navigating to /fr/revenus renders the french income page (single) and passes a11y checks', async ({ page }) => {
  const estimator = new PlaywrightEstimatorPage(page);
  const resp = await seedSessionData(page, singleStagedSession);
  expect(resp.status()).toBe(200);

  await page.goto('/fr/revenus');
  await estimator.isLoaded('income', 'fr');

  await waitForCurrencyFields(page, singleCurrencyFieldNames);

  expect(await formatHtml(await page.locator('main').innerHTML())).toMatchSnapshot();
  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
});

test('Navigating to /fr/revenus renders the french income page (married) and passes a11y checks', async ({ page }) => {
  const estimator = new PlaywrightEstimatorPage(page);
  const resp = await seedSessionData(page, marriedStagedSession);
  expect(resp.status()).toBe(200);

  await page.goto('/fr/revenus');
  await estimator.isLoaded('income', 'fr');

  await waitForCurrencyFields(page, marriedCurrencyFieldNames);

  expect(await formatHtml(await page.locator('main').innerHTML())).toMatchSnapshot();

  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
});

test('iPhone Safari - numeric input test (en, single)', async ({ page }) => {
  // Override `navigator.platform`
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'platform', {
      get: () => 'iPhone',
    });
  });

  const estimator = new PlaywrightEstimatorPage(page);
  const resp = await seedSessionData(page, singleStagedSession);
  expect(resp.status()).toBe(200);

  await page.goto('/en/income');
  await estimator.isLoaded('income');

  expect(await formatHtml(await page.locator('main').innerHTML())).toMatchSnapshot();
  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
});
