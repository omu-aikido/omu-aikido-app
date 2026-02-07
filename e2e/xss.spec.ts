import { test, expect } from '@playwright/test';

import { login } from './auth-helper';

test.describe('XSS Prevention', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/account');
    await page.waitForLoadState('networkidle');
  });

  test('sanitizes input in user profile', async ({ page }) => {
    // アラート監視
    let dialogTriggered = false;
    page.on('dialog', (dialog) => {
      dialogTriggered = true;
      dialog.dismiss();
    });

    // 編集ボタンをクリック
    await page.getByRole('button', { name: '編集' }).first().click();

    // 入力フィールドが表示されるのを待つ
    // UiInputコンポーネントでidが設定されていないためlabelから親要素へ辿る
    const lastNameInput = page.locator('label.form-label', { hasText: '姓' }).locator('..').locator('input');
    await expect(lastNameInput).toBeVisible();

    // XSSペイロード入力
    const xssPayload = '<script>alert("XSS")</script>';
    await lastNameInput.fill(xssPayload);

    // 保存
    await page.getByRole('button', { name: '保存' }).click();

    // 期待動作:
    // 1. バリデーションエラーで拒否される
    // 2. サニタイズされて保存される

    // 保存結果は成功（フォーム閉じる）か失敗（エラー表示）のどちらかで判定
    const errorMessage = page.locator('form .text-red-500');
    await expect
      .poll(async () => {
        if (await lastNameInput.isHidden()) return 'hidden';
        if (await errorMessage.isVisible()) return 'error';
        return 'pending';
      })
      .not.toBe('pending');

    if (await errorMessage.isVisible()) {
      console.log('XSS Payload rejected by validation (Expected behavior)');
      expect(dialogTriggered).toBe(false);
      return; // テスト終了
    }

    // 保存成功した場合（フォームが閉じた場合）

    // アラートが出ていないことを確認
    expect(dialogTriggered).toBe(false);

    // 入力値がエスケープされて表示されていることを確認
    const nameElement = page.getByRole('heading', { level: 2 });

    // innerTextには入力した文字列がそのまま表示されていること（サニタイズ後の表示）
    await expect(nameElement).toContainText(xssPayload);

    // innerHTMLにはエスケープされたエンティティが含まれていること
    const html = await nameElement.innerHTML();
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });
});
