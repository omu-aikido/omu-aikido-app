import { expect, test } from "@playwright/test"

test.describe("認証済みユーザーテスト", () => {
  test("ダッシュボードページにアクセスできる", async ({ page }) => {
    await page.goto("/")

    // ダッシュボードページが表示されていることを確認
    await expect(page.locator("h1")).toHaveText("記録追加")
  })

  test("プロフィールページにアクセスできる", async ({ page }) => {
    await page.goto("/account")

    // プロフィールページが表示されていることを確認
    await expect(page.locator("h1")).toHaveText("アカウント")
  })
})
