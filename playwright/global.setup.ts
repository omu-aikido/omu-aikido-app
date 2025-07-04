// playwright/global.setup.ts
import { clerk, clerkSetup } from "@clerk/testing/playwright"
import { test as setup } from "@playwright/test"
import path from "path"

// Playwright の設定
setup("global setup", async ({}) => {
  await clerkSetup()
})

// 認証ファイルのパス
const authFile = "./playwright/.clerk/user.json"

// 認証してストレージに状態を保存
setup("authenticate and save state to storage", async ({ page }) => {
  // 未認証ページに移動
  await page.goto("/")

  // Clerk の sign in ヘルパーを使用して認証
  await clerk.signIn({
    page,
    signInParams: {
      strategy: "password",
      identifier: process.env.E2E_CLERK_USER_USERNAME!,
      password: process.env.E2E_CLERK_USER_PASSWORD!,
    },
  })

  // 保護されたページにアクセスできることを確認
  await page.goto("/dashboard")
  await page.waitForSelector("h1:has-text('Dashboard')")

  // 認証状態を保存
  await page.context().storageState({ path: authFile })
})
