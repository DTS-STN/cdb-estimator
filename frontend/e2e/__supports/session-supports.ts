import type { Page } from '@playwright/test';

export async function seedSessionData(page: Page, data: object) {
  return await page.request.post('/stage-session', { data: data });
}
