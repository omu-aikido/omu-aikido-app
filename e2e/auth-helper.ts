import { clerk } from '@clerk/testing/playwright';
import { Page, expect } from '@playwright/test';

interface RecordRange {
  startDate: string;
  endDate: string;
}

export async function login(page: Page) {
  // Navigate first to establish the domain for cookies
  await page.goto('/');

  if (!process.env.E2E_EMAIL || !process.env.E2E_PASSWORD) {
    throw new Error('E2E_EMAIL and E2E_PASSWORD must be set for Clerk sign-in');
  }

  await clerk.signIn({
    page,
    signInParams: {
      strategy: 'password',
      identifier: process.env.E2E_EMAIL,
      password: process.env.E2E_PASSWORD,
    },
  });

  // Wait for an element that only appears when logged in (SidePanel button)
  // This ensures the app recognizes the user as authenticated
  await expect(page.getByLabel('メニューを開く')).toBeVisible({ timeout: 15000 });
}

export async function clearActivitiesInRange(page: Page, range: RecordRange) {
  const res = await page.request.get('/api/user/record', {
    params: {
      startDate: range.startDate,
      endDate: range.endDate,
    },
  });
  if (!res.ok()) return;
  const data = (await res.json()) as { activities?: { id: string }[] };
  const ids = data.activities?.map((a) => a.id) ?? [];
  if (ids.length === 0) return;
  await page.request.delete('/api/user/record', {
    data: { ids },
  });
}
