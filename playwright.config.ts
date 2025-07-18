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
  testDir: "tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:4173",
    trace: "on-first-retry",
  },

  projects: [
    {
      name: "authsetup",
      testMatch: "tests/e2e/global.setup.ts",
    },
    {
      name: "Unauthorized",
      testMatch: /.*unauth\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
      dependencies: ["authsetup"],
    },
    {
      name: "Authorized",
      testMatch: /.*auth\.spec\.ts/,
      use: { ...devices["Desktop Chrome"], storageState: "playwright/.clerk/user.json" },
    },
  ],

  webServer: {
    command: "pnpm preview",
    url: "http://localhost:4173",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
})
