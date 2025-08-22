import { expect, test } from "@playwright/test"

import { db } from "../common/db"
import { createRecordHelpers } from "../common/record-helpers"

test.describe("record page - desktop", () => {
  let testDb: db

  test.beforeEach(async ({ page }) => {
    // テストワーカーのインデックスを使用してdbインスタンスを作成
    testDb = new db()

    // UIとの同期のためページをリロード
    await page.goto("/record")
    await page.waitForLoadState("networkidle")

    // 初期表示の確認
    await expect(page.getByTestId("record-page-container")).toBeVisible()
    await expect(page.getByTestId("monthly-activity-grid")).toBeVisible()
  })

  test("add record", async ({ page }) => {
    await testDb.delete({
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      date: 27,
    })
    const helpers = createRecordHelpers(page, false)

    // 初期状態の確認
    await helpers.verifyDayHasNoRecord(27)

    // 記録追加フロー
    await helpers.clickDay(27)
    await helpers.verifyDailyActivityEmpty()
    await helpers.addRecord()
    await helpers.verifyDailyActivityItem(0)
    await helpers.saveRecord()

    // 記録確認と送信
    await helpers.verifyDayHasRecord(27)
    await helpers.verifySubmitButtonState(true)
    await helpers.verifyResetButtonState(true)
    await helpers.submitRecords()
    await helpers.verifySubmitButtonState(false, "登録")
    await helpers.verifyDayHasRecord(27)

    await testDb.delete({
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      date: 27,
    })
  })

  test("reset edit with accept", async ({ page }) => {
    await testDb.delete({
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      date: 23,
    })
    await testDb.delete({
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      date: 24,
    })
    const helpers = createRecordHelpers(page, false)

    // 初期状態確認
    await helpers.verifyDayHasNoRecord(23)
    await helpers.verifyDayHasNoRecord(24)

    // 複数日の記録追加
    await helpers.clickDay(23)
    await helpers.addRecord()
    await helpers.saveRecord()
    await helpers.clickDay(24)
    await helpers.addRecord()
    await helpers.saveRecord()

    // 記録確認とリセット
    await helpers.verifyDayHasRecord(23)
    await helpers.verifyDayHasRecord(24)
    await helpers.verifyResetButtonState(true)
    await helpers.resetRecords(true)

    // リセット後確認
    await helpers.verifyDayHasNoRecord(23)
    await helpers.verifyDayHasNoRecord(24)
  })

  test("delete record", async ({ page }) => {
    await testDb.add({
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      date: 25,
      period: 1.5,
    })
    const helpers = createRecordHelpers(page, false)
    await helpers.verifyDayHasRecord(25)

    // 記録削除
    await helpers.clickDay(25)
    await helpers.verifyDailyActivityItem(0)
    await helpers.deleteRecord(0)
    await helpers.verifyDailyActivityEmpty()
    await helpers.saveRecord()

    // 削除確認と送信
    await helpers.submitRecords()
    await helpers.verifyDayHasNoRecord(25)
    await testDb.delete({
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      date: 25,
    })
  })

  test("cancel add record", async ({ page }) => {
    await testDb.delete({
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      date: 26,
    })
    const helpers = createRecordHelpers(page, false)

    // 初期状態確認
    await helpers.verifyDayHasNoRecord(26)

    // 記録追加開始とキャンセル
    await helpers.clickDay(26)
    await helpers.verifyDayHasNoRecord(26)
    await helpers.addRecord()
    await page.getByTestId("back-button").click()

    // キャンセル後確認
    await helpers.clickDay(26)
    await helpers.verifyDayHasNoRecord(26)
    await testDb.delete({
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      date: 26,
    })
  })
})
