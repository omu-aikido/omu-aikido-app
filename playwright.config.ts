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
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: { baseURL: "http://localhost:4173", trace: "on-first-retry" },

  projects: [
    { name: "Authentication Setup", testMatch: "tests/e2e/global.setup.ts" },
    {
      name: "Security",
      testDir: "tests/e2e/security/",
      testMatch: "*.spec.ts",
      use: { ...devices["chromium"] },
      dependencies: ["Authentication Setup"],
    },
    {
      name: "Chromium",
      testDir: "tests/e2e/components/desktop",
      use: { ...devices["Desktop Chrome"], storageState: "playwright/.clerk/user.json" },
      dependencies: ["Authentication Setup"],
    },
    {
      name: "Mobile Chrome",
      testDir: "tests/e2e/components/mobile",
      use: { ...devices["Pixel 5"], storageState: "playwright/.clerk/user.json" },
      dependencies: ["Authentication Setup"],
    },
    {
      name: "Mobile Safari",
      testDir: "tests/e2e/components/mobile",
      use: { ...devices["iPhone 12"], storageState: "playwright/.clerk/user.json" },
      dependencies: ["Authentication Setup"],
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: "pnpm preview",
    url: "http://localhost:4173",
    reuseExistingServer: !process.env.CI,
  },
})
