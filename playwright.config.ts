import { defineConfig, devices } from "@playwright/test"

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },

  projects: [
    {
      name: "global setup",
      testMatch: /global\.setup\.ts/,
    },
    {
      name: "UnAuthorized Security Test",
      testMatch: /.*sec\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "Authorized Security Test",
      testMatch: /.*auth\.spec\.ts/,
      use: { ...devices["Desktop Chrome"], storageState: "playwright/.clerk/user.json" },
    },
  ],

  webServer: {
    command: "npm run preview",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
})
