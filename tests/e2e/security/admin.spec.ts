import { expect, test } from "@playwright/test"

import { updateRole } from "./_helper"

test.describe("未認証ユーザーテスト", () => {
  test("管理者ページにアクセスできない", async ({ page }) => {
    await page.goto("/admin")
    await expect(page).toHaveURL(/\/sign-in\?redirect_url=.*/)
  })
})

test.describe("一般ユーザーテスト", () => {
  test.use({ storageState: "playwright/.clerk/user.json" })
  updateRole({ role: "member" })
  test("管理者ページにアクセスできない", async ({ page }) => {
    await page.goto("/admin")
  })
})

test.describe("管理権限ユーザーテスト", () => {
  test.use({ storageState: "playwright/.clerk/user.json" })
  updateRole({ role: "captain" })
  test("管理者ページにアクセスできる", async ({ page }) => {
    await page.goto("/admin")
  })
})
