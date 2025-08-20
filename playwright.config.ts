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
  workers: 2,
  retries: 1,
  reporter: "html",
  use: {
    baseURL: "http://localhost:4173",
    trace: "on-first-retry",
    video: { mode: "retain-on-failure", size: { width: 960, height: 540 } },
  },

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
      testMatch: /tests\/e2e\/.*(desktop|common)\/.*\.spec\.ts$/,
      use: {
        ...devices["Desktop Chrome"],
        storageState: "playwright/.clerk/user.json",
        isMobile: false,
      },
      dependencies: ["Authentication Setup"],
    },
    {
      name: "Mobile Safari",
      testMatch: /tests\/e2e\/.*(mobile|common)\/.*\.spec\.ts$/,
      use: {
        ...devices["iPhone 12"],
        storageState: "playwright/.clerk/user.json",
        isMobile: true,
      },
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
