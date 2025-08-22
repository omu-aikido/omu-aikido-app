import { expect, test } from "@playwright/test"

import { db } from "../common/db"
import { createRecordHelpers } from "../common/record-helpers"

test.describe("record page - mobile", () => {
  let testDb: db

  test.beforeEach(async ({ page }) => {
    // テストワーカーのインデックスを使用してdbインスタンスを作成
    testDb = new db()

    // テスト開始前にデータベースを初期化
    await testDb.list()
    await testDb.clear()

    // UIとの同期のためページをリロード
    await page.goto("/record")
    await page.waitForLoadState("networkidle")

    // 初期表示の確認
    await expect(page.getByTestId("record-page-container")).toBeVisible()
    await expect(page.getByTestId("monthly-activity-list")).toBeVisible()
  })

  test.afterEach(async () => {
    await testDb.list()
    await testDb.clear()
    await testDb.list()
  })

  test("add record", async ({ page }) => {
    await testDb.delete({
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      date: 1,
    })
    // beforeEachで既にページ読み込み済みなので、アサーションのみ作成
    const helpers = createRecordHelpers(page, true)

    // 初期状態の確認
    await helpers.verifyDayHasNoRecord(1)

    // 記録追加フロー
    await helpers.clickDay(1)
    await helpers.verifyDailyActivityEmpty()
    await helpers.addRecord()
    await helpers.verifyDailyActivityItem(0)
    await helpers.saveRecord()

    // 記録確認と送信
    await helpers.verifyDayHasRecord(1)
    await helpers.submitRecords()
    await helpers.verifyDayHasRecord(1)
  })

  test("reset edit with accept", async ({ page }) => {
    await testDb.delete({
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      date: 2,
    })
    const helpers = createRecordHelpers(page, true)

    // 初期状態確認
    await helpers.verifyDayHasNoRecord(2)

    // 複数日の記録追加
    await helpers.clickDay(2)
    await helpers.addRecord()
    await helpers.saveRecord()

    // 記録確認とリセット
    await helpers.verifyDayHasRecord(2)
    await helpers.verifyResetButtonState(true)
    await helpers.resetRecords(true)

    // リセット後確認
    await helpers.verifyDayHasNoRecord(2)
    await helpers.verifyDayHasNoRecord(3)
    await testDb.delete({
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      date: 2,
    })
    await testDb.delete({
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      date: 3,
    })
  })

  test("delete record", async ({ page }) => {
    await testDb.add({
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      date: 5,
      period: 1.5,
    })
    const helpers = createRecordHelpers(page, true)

    // 記録削除
    await helpers.clickDay(5)
    await helpers.verifyDailyActivityItem(0)
    await helpers.deleteRecord(0)
    await helpers.verifyDailyActivityEmpty()
    await helpers.saveRecord()

    // 削除確認と送信
    await helpers.submitRecords()
    await helpers.verifyDayHasNoRecord(5)
    await testDb.delete({
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      date: 5,
    })
  })

  test("cancel add record", async ({ page }) => {
    await testDb.delete({
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      date: 4,
    })
    const helpers = createRecordHelpers(page, true)

    // 初期状態確認
    await helpers.verifyDayHasNoRecord(4)

    // 記録追加開始とキャンセル
    await helpers.clickDay(4)
    await helpers.verifyDayHasNoRecord(4)
    await helpers.addRecord()
    await page.getByTestId("back-button").click()

    // キャンセル後確認
    await helpers.clickDay(4)
    await helpers.verifyDayHasNoRecord(4)
    await testDb.delete({
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      date: 4,
    })
  })
})
