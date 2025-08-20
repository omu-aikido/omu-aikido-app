import { clerk, clerkSetup } from "@clerk/testing/playwright"
import { test as setup } from "@playwright/test"

const authFile = "playwright/.clerk/user.json"

setup.describe.configure({ mode: "serial" })

setup("global setup", async ({ page, context: _context }) => {
  await clerkSetup()
  await page.goto("/sign-in", { waitUntil: "networkidle", timeout: 60000 })

  try {
    await clerk.signIn({
      page,
      signInParams: {
        strategy: "password",
        identifier: process.env.E2E_CLERK_USER_USERNAME!,
        password: process.env.E2E_CLERK_USER_PASSWORD!,
      },
    })
  } catch (error) {
    throw error
  }

  // ダッシュボードページへ遷移
  await page.goto("/", { waitUntil: "networkidle", timeout: 10000 })

  // 認証状態を保存
  await page.context().storageState({ path: authFile })
})
