// playwright/global.setup.ts
import { clerk, clerkSetup } from "@clerk/testing/playwright"
import { test as setup } from "@playwright/test"

// 認証ファイルのパス
const authFile = "playwright/.clerk/user.json"

// 認証してストレージに状態を保存
setup("authenticate and save state to storage", async ({ page, context: _context }) => {
  process.env.CLERK_FRONTEND_API_URL = process.env.CLERK_FRONTEND_API_URL || "http://localhost:4173"
  // console.log("CLERK_FRONTEND_API_URL:", process.env.CLERK_FRONTEND_API_URL)
  // console.log("global.setup.ts is running")

  // Clerkの初期化を最初に実行
  await clerkSetup()

  await page.goto("/sign-in", {
    waitUntil: "networkidle",
    timeout: 60000,
  })

  // Clerkが読み込まれるまで待機
  await page.waitForFunction(() => window.Clerk !== undefined, {
    timeout: 30000,
  })

  // Clerk の sign in ヘルパーを使用して認証
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
  // 認証完了後、ダッシュボードページが表示されることを確認
  await page.waitForSelector("h1:has-text('記録追加')", {
    timeout: 10000,
  })

  // 認証状態を保存
  await page.context().storageState({ path: authFile })
})
