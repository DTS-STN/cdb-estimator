import { browser } from "k6/browser";
import { scenario } from "k6/execution";
import { Options } from "k6/options";
import { check, sleep } from "k6";

const baseUrl = __ENV.ESTIMATOR_CDB_BASE_URL ?? "";
const screenshotsEnabled = __ENV.SCREENSHOTS_ENABLED === "true";

if (!baseUrl) {
  throw new Error("Base URL is not defined. Please set the ESTIMATOR_CDB_BASE_URL environment variable.");
}

// Define test options
export let options: Options = {
  scenarios: {
    per_vu: {
      executor: "shared-iterations",
      vus: 5,
      iterations: 25,
      options: {
        browser: {
          type: "chromium",
        },
      },
    },
  },
};

export default async function () {
  const context = await browser.newContext();
  const page = await context.newPage();

  const { iterationInTest: id, startTime } = scenario;

  try {
    console.log(`Starting test iteration ${id} at ${startTime}`);

    await page.goto(baseUrl);
    await page.waitForLoadState();
    await page.waitForTimeout(250); // Wait for additional 250 ms to ensure the page is fully loaded

    await page.evaluate(() => {
      const link = document.querySelector<HTMLAnchorElement>('a[href="/en"]');
      link?.click(); // Simulate a native click
    });

    // Index Page
    await page.waitForSelector("//h1[text()='Canada Disability Benefit Estimator']");

    screenshotsEnabled && (await page.screenshot({ path: `test-results/screenshots/${startTime}-${id}-step-0.png` }));
    await page.locator('a[href="/en/marital-status"]').click();

    // Marital Status - Single
    await page.waitForSelector("//h1[text()='Step 1 of 2: Marital Status']");
    await page.locator("#input-radio-marital-status-option-0-label").check();

    screenshotsEnabled && (await page.screenshot({ path: `test-results/screenshots/${startTime}-${id}-step-1.png` }));
    await page.locator('button#continue-button[value="next"]').click();

    // Income
    await page.waitForSelector("//h1[text()='Step 2 of 2: Income']");
    await page.locator('input[name="individual-net-income"]').type("23500");
    await page.locator('input[name="individual-working-income"]').type("0");
    await page.locator('input[name="individual-claimed-income"]').type("0");
    await page.locator('input[name="individual-claimed-repayment"]').type("0");

    // Wait for the inputs to be filled before clicking the button
    await page.waitForSelector('//input[@name="individual-net-income" and @value="23,500"]');
    await page.waitForSelector('//input[@name="individual-working-income" and @value="0"]');
    await page.waitForSelector('//input[@name="individual-claimed-income" and @value="0"]');
    await page.waitForSelector('//input[@name="individual-claimed-repayment" and @value="0"]');

    screenshotsEnabled && (await page.screenshot({ path: `test-results/screenshots/${startTime}-${id}-step-2.png` }));
    await page.locator('button#continue-button[value="next"]').click();

    // Results
    await page.waitForSelector("//h1[text()='Results']");
    screenshotsEnabled && (await page.screenshot({ path: `test-results/screenshots/${startTime}-${id}-step-3.png` }));

    // Final check to confirm we reached the end
    check(null, {
      "Reached Results page": () => true,
    });
  } catch (error) {
    console.error("Error during test execution:", error);
    await page.screenshot({ path: `test-results/screenshots/${startTime}-${id}-error.png` });
    check(null, {
      "Reached Results page": () => false,
    });
  } finally {
    await page.close();
    await context.close();
  }

  sleep(1); // Simulate user think time
}
