import { setupClerkTestingToken } from '@clerk/testing/playwright';
import { test, expect } from '@playwright/test';

import { login } from './auth-helper';

test.describe('Security Headers & Access Control', () => {
  test('response headers contain security directives', async ({ request }) => {
    // APIエンドポイントに対してリクエスト（Honoサーバーが処理するパス）
    const response = await request.get('/api/auth-status');
    const headers = response.headers();

    // CSP
    expect(headers['content-security-policy']).toBeDefined();
    expect(headers['content-security-policy']).toContain("default-src 'self'");

    // X-Frame-Options
    expect(headers['x-frame-options']).toBe('DENY');

    // X-Content-Type-Options
    expect(headers['x-content-type-options']).toBe('nosniff');

    // Referrer-Policy
    expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
  });

  test('rejects unauthenticated API access', async ({ request }) => {
    // 認証なしでAPIアクセス
    const response = await request.get('/api/user/record');

    // Honoアプリは認証なしの場合 401 を返す実装になっている
    expect(response.status()).toBe(401);
  });

  test('rejects unauthorized access to other user data', async ({ page }) => {
    // まず認証トークンを取得するためにログイン状態を作る必要があるが、
    // APIテスト(request fixture)では認証情報の共有が難しい場合がある。
    // setupClerkTestingTokenはBrowserContextに作用するが、request fixtureは別コンテキストの可能性がある。
    // ここでは page.request を使用して、ログイン済みブラウザコンテキストからのリクエストを行う。

    await setupClerkTestingToken({ page });
    await login(page);

    // 他人のUserIDを指定してリクエスト（バリデーションを通る形式: user_ + 27 chars）
    const validFakeUserId = 'user_' + 'x'.repeat(27);
    const response = await page.request.get('/api/user/record', {
      params: {
        userId: validFakeUserId,
      },
    });

    console.log(`Unauthorized Access Test - Status: ${response.status()}`);
    console.log(`Unauthorized Access Test - Body: ${await response.text()}`);

    // サーバー実装では userId !== auth.userId の場合 403 を返す
    expect(response.status()).toBe(403);
  });
});
