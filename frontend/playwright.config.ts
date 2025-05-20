import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e/',
  snapshotPathTemplate: '{testDir}/__snapshots__/{testFilePath}/{arg}{ext}',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  expect: {
    timeout: 10_000, // Timeout for expect() assertions
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  use: {
    baseURL: `http://localhost:3000/`,
    actionTimeout: 10_000, // Timeout for each action like click(), fill(), etc.
    navigationTimeout: 15_000, // Timeout for navigation-related waits (goto, waitForLoadState, etc.)
  },
  webServer: {
    command: 'tsx --import ./app/.server/telemetry.ts ./app/.server/express/server.ts',
    reuseExistingServer: !process.env.CI,
    url: `http://localhost:3000/`,
  },
});
