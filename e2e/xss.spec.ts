import { setupClerkTestingToken } from '@clerk/testing/playwright'
import { test, expect } from '@playwright/test'

import { login } from './auth-helper'

test.describe('XSS Prevention', () => {
  test.beforeEach(async ({ page }) => {
    await setupClerkTestingToken({ page })
    await login(page)
    await page.goto('/account')
    await page.waitForLoadState('networkidle')
  })

  test('sanitizes input in user profile', async ({ page }) => {
    // アラート監視
    let dialogTriggered = false
    page.on('dialog', (dialog) => {
      dialogTriggered = true
      dialog.dismiss()
    })

    // 編集ボタンをクリック
    await page.getByRole('button', { name: '編集' }).first().click()

    // 入力フィールドが表示されるのを待つ
    // UiInputコンポーネントでidが設定されていないためgetByLabelが効かない対策
    const lastNameInput = page.locator('.input-wrapper').filter({ hasText: '姓' }).locator('input')
    await expect(lastNameInput).toBeVisible()

    // XSSペイロード入力
    const xssPayload = '<script>alert("XSS")</script>'
    await lastNameInput.fill(xssPayload)

    // 保存
    await page.getByRole('button', { name: '保存' }).click()

    // 期待動作:
    // 1. バリデーションエラーで拒否される
    // 2. サニタイズされて保存される

    try {
      // 保存成功（フォームが閉じる）を少し待つ
      await expect(lastNameInput).not.toBeVisible({ timeout: 3000 })
    } catch {
      // フォームが閉じなかった場合、バリデーションエラーが出ているか確認
      const errorElement = page.locator('.message-error')
      if (await errorElement.isVisible()) {
        console.log('XSS Payload rejected by validation (Expected behavior)')
        expect(dialogTriggered).toBe(false)
        return // テスト終了
      }
      // エラーも出ずフォームも閉じない場合は失敗として例外を再スロー
      throw new Error('Save failed: Form did not close and no error message appeared')
    }

    // 保存成功した場合（フォームが閉じた場合）

    // アラートが出ていないことを確認
    expect(dialogTriggered).toBe(false)

    // 入力値がエスケープされて表示されていることを確認
    const nameElement = page.locator('.name')

    // innerTextには入力した文字列がそのまま表示されていること（サニタイズ後の表示）
    await expect(nameElement).toContainText(xssPayload)

    // innerHTMLにはエスケープされたエンティティが含まれていること
    const html = await nameElement.innerHTML()
    expect(html).not.toContain('<script>')
    expect(html).toContain('&lt;script&gt;')
  })
})
