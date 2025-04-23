import { expect, test } from '@playwright/test';

test('Single person can obtain results', async ({ page }) => {
  // splash page
  await page.goto('/');

  // dashboard
  await page.getByText(/english/i).click();
  await page.getByText(/start/i).click();

  // marital-status
  await page.getByRole('radio', { name: /single/i }).check();
  await page.getByRole('button', { name: /continue/i }).click();

  // income
  await page.getByRole('textbox', { name: /net income/i }).fill('23000.31');
  await page.getByRole('textbox', { name: /working income/i }).fill('0');
  await page.getByRole('textbox', { name: /^(?=.*uccb)(?=.*rdsp)(?=.*income).*/i }).fill('0');
  await page.getByRole('textbox', { name: /^(?=.*uccb)(?=.*rdsp)(?=.*repayment).*/i }).fill('0');
  await page.getByRole('button', { name: /estimate/i }).click();

  // result
  await page.locator('html').waitFor();
  await expect(page.getByRole('main')).toContainText('$199.99');
});
