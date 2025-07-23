import { expect, test } from "@playwright/test"

test.describe("未認証ユーザーテスト", () => {
  test("ダッシュボードにアクセスできない", async ({ page }) => {
    await page.goto("/")
    await expect(page).toHaveURL(/\/sign-in\?redirect_url=.*/)
  })

  test("レコードページにアクセスできない", async ({ page }) => {
    await page.goto("/record")
    await expect(page).toHaveURL(/\/sign-in\?redirect_url=.*/)
  })

  test("アカウント管理ページにログインできない", async ({ page }) => {
    await page.goto("/account")
    await expect(page).toHaveURL(/\/sign-in\?redirect_url=.*/)
  })
})

test.describe("サインインユーザーテスト", () => {
  test.use({ storageState: "playwright/.clerk/user.json" })
  test("ダッシュボードにアクセスできる", async ({ page }) => {
    await page.goto("/")
    await expect(page.locator("h1")).toHaveText("記録追加")
  })

  test("レコードページにアクセスできる", async ({ page }) => {
    await page.goto("/record")
    await expect(page.locator("h1")).toHaveText("記録一覧")
  })

  test("アカウント管理ページにログインできる", async ({ page }) => {
    await page.goto("/account")
    await expect(page.locator("h1")).toContainText("アカウント: ")
  })
})
