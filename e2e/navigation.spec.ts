import { setupClerkTestingToken } from '@clerk/testing/playwright'
import { test, expect } from '@playwright/test'

import { login } from './auth-helper'

test.describe('Navigation & Route Guards', () => {
  test('redirects unauthenticated user to sign-in from protected route', async ({ page }) => {
    // 認証なしで保護されたページ（ホーム）にアクセス
    await page.goto('/')
    // サインインページにリダイレクトされることを確認
    await expect(page).toHaveURL(/\/sign-in.*/)

    // レコードページへの直接アクセスも同様
    await page.goto('/record')
    await expect(page).toHaveURL(/\/sign-in.*/)
  })

  test('redirects authenticated user away from auth pages', async ({ page }) => {
    await setupClerkTestingToken({ page })
    await login(page)

    // サインインページにアクセス
    await page.goto('/sign-in')
    // ホームにリダイレクトされることを確認
    await expect(page).toHaveURL('/')

    // サインアップページへのアクセスも同様
    await page.goto('/sign-up')
    await expect(page).toHaveURL('/')
  })

  test('allows admin user to access admin routes', async ({ page }) => {
    await setupClerkTestingToken({ page })
    await login(page)

    // 管理者ページにアクセス
    await page.goto('/admin')
    // 管理者としてアクセスが許可され、リダイレクトされないことを確認
    await expect(page).toHaveURL('/admin')
  })

  test('shows 404 page for non-existent routes', async ({ page }) => {
    // 存在しないページにアクセス
    await page.goto('/non-existent-page-12345')

    // 404ページの要素が表示されることを確認
    await expect(page.getByText('ページが見つかりません')).toBeVisible()
    await expect(page.getByAltText('404 Not Found')).toBeVisible()
    await expect(page.getByRole('link', { name: 'トップに戻る' })).toBeVisible()
  })
})
