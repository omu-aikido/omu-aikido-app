// ユーザープロファイル設定・更新のE2Eテスト
import { test, expect } from "@playwright/test"
import { ProfileSetupPage } from "./pages/ProfileSetupPage"

test.describe("プロファイル設定", () => {
  test("プロファイル初期設定", async ({ page }) => {
    const profileSetup = new ProfileSetupPage(page)
    await profileSetup.goto()
    await profileSetup.setupProfile("新しいユーザー", "newuser@example.com")
    await expect(profileSetup.nameInput).toHaveValue("新しいユーザー")
    await expect(profileSetup.emailInput).toHaveValue("newuser@example.com")
  })

  test("プロファイル情報の更新", async ({ page }) => {
    const profileSetup = new ProfileSetupPage(page)
    await profileSetup.goto()
    await profileSetup.setupProfile("更新ユーザー", "update@example.com")
    await expect(profileSetup.nameInput).toHaveValue("更新ユーザー")
    await expect(profileSetup.emailInput).toHaveValue("update@example.com")
  })
})
