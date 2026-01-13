import { clerkSetup } from '@clerk/testing/playwright'
import { test as setup } from '@playwright/test'

setup('global setup', async () => {
  // @clerk/testingがCLERK_PUBLISHABLE_KEYを期待するため、VITE_から設定
  if (process.env.VITE_CLERK_PUBLISHABLE_KEY && !process.env.CLERK_PUBLISHABLE_KEY) {
    process.env.CLERK_PUBLISHABLE_KEY = process.env.VITE_CLERK_PUBLISHABLE_KEY
  }

  await clerkSetup({
    publishableKey: process.env.VITE_CLERK_PUBLISHABLE_KEY,
    secretKey: process.env.CLERK_SECRET_KEY,
    frontendApiUrl: process.env.CLERK_FRONTEND_API_URL,
  })
})
