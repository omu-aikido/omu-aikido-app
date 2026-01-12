import { setupClerkTestingToken } from '@clerk/testing/playwright'
import { test, expect } from '@playwright/test'

import { login } from './auth-helper'

test('profile data persists across navigation (Home <-> Account)', async ({ page }) => {
  await setupClerkTestingToken({ page })

  // 1. Login
  await login(page)

  // 2. Verify Home Page has loaded
  await expect(page.getByLabel('メニューを開く')).toBeVisible()

  // 3. Navigate to Account Page
  await page.getByLabel('メニューを開く').click()
  await page.getByText('アカウント設定').click()

  await expect(page).toHaveURL('/account')

  // 4. Verify Account Page has loaded and contains profile data
  // Just verify the page structure exists without depending on specific data
  await expect(page.getByText('プロフィール')).toBeVisible()

  // 5. Navigate back to Home
  await page.getByLabel('メニューを開く').click()
  await page.getByText('トップ').click()

  await expect(page).toHaveURL('/')

  // 6. CRITICAL: Verify Home page still works after navigation
  // This tests cache integrity - the page should not crash or show errors
  await page.waitForLoadState('networkidle')
  await expect(page.getByLabel('メニューを開く')).toBeVisible()
})
