import { test, expect } from '@playwright/test';

import { login } from './auth-helper';

test('shows error message when record list fails to load', async ({ page }) => {
  await login(page);

  await page.route('**/api/user/record**', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' }),
      });
      return;
    }
    await route.continue();
  });

  await page.goto('/record');

  await expect(page.getByText('活動記録の取得に失敗しました')).toBeVisible();
});
