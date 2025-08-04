import { test, expect } from "@playwright/test"

test("test", async ({ page }) => {
  await page.goto("/account")
  await page.getByRole("link", { name: "ポータル" }).click()
  await page
    .getByRole("link", { name: "アカウント アカウント設定ページ 詳細を見る" })
    .click()
  await expect(page.locator("h1")).toContainText("アカウント: test taro")
  await page.getByRole("tab", { name: "ステータス" }).click()
  await expect(page.locator("form")).toContainText("所持級段位")
  await page.getByRole("tab", { name: "プロフィール" }).click()
  await page.getByRole("link", { name: "Discordアカウント連携" }).click()
  await expect(page.getByRole("main")).toContainText("Discord連携する")
  await page.getByRole("link", { name: "ポータル" }).click()
})
