import { test, expect } from '@playwright/test';

import { login } from './auth-helper';

test('redirects to sign-in after sign out when accessing protected route', async ({ page }) => {
  await login(page);

  await page.getByLabel('メニューを開く').click();
  const sideMenu = page.getByRole('dialog', { name: 'サイドメニュー' });
  await expect(sideMenu).toBeVisible();
  await sideMenu.getByRole('button', { name: 'ログアウト' }).click();

  await expect(page).toHaveURL(/\/sign-in/, { timeout: 15000 });

  await page.goto('/record');
  await expect(page).toHaveURL(/\/sign-in/);
});
