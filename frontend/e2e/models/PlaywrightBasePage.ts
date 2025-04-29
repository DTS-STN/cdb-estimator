import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';

export class PlaywrightBasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async isLoaded(url: string | RegExp, language: Language, heading: string | RegExp) {
    await this.page.locator('main').waitFor();

    await expect(this.page.locator('html')).toHaveAttribute('lang', language);

    await expect(this.page).toHaveURL(url);
    await expect(this.page.getByRole('heading', { level: 1, name: heading })).toBeVisible();
  }
}
