import { expect, test } from '@playwright/test';

import { PlaywrightEstimatorPage } from './models/PlaywrightEstimatorPage';

test('Single person can obtain results', async ({ page }) => {
  const estimator = new PlaywrightEstimatorPage(page);

  // splash page
  await page.goto('/');
  await page.getByText(/english/i).click();

  // dashboard
  await estimator.isLoaded('index');
  await page.getByText(/start/i).click();

  // marital-status
  await estimator.isLoaded('marital-status');
  await page.getByRole('radio', { name: /single/i }).check();
  await page.getByRole('button', { name: /continue/i }).click();

  // income
  await estimator.isLoaded('income');
  await page.getByRole('textbox', { name: /net income/i }).fill('23000.31');
  await page.getByRole('textbox', { name: /working income/i }).fill('0');
  await page.getByRole('textbox', { name: /^(?=.*uccb)(?=.*rdsp)(?=.*income).*/i }).fill('0');
  await page.getByRole('textbox', { name: /^(?=.*uccb)(?=.*rdsp)(?=.*repayment).*/i }).fill('0');
  await page.getByRole('button', { name: /estimate/i }).click();

  // result
  await estimator.isLoaded('results');
  await expect(page.getByRole('main')).toContainText('$199.99');
});
