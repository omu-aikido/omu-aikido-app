import { clerkMiddleware, getAuth } from '@hono/clerk-auth'
import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { secureHeaders } from 'hono/secure-headers'

import adminApp from './app/admin'
import userApp from './app/user'
import { webhooks } from './app/webhooks/clerk'
import { edgeCacheMiddleware } from './middleware/cache'

const app = new Hono<{ Bindings: Env }>()

app.use(logger())
app.use((c, next) => {
  return secureHeaders({
    contentSecurityPolicy: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        'https://*.clerk.accounts.dev',
        'https://accounts.omu-aikido.com',
        c.env.CLERK_FRONTEND_API_URL,
      ],
      connectSrc: [
        "'self'",
        'https://*.clerk.accounts.dev',
        'https://accounts.omu-aikido.com',
        c.env.CLERK_FRONTEND_API_URL,
      ],
      imgSrc: ["'self'", 'https://img.clerk.com', 'data:'],
      workerSrc: ["'self'", 'blob:'],
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
    xFrameOptions: 'DENY',
    referrerPolicy: 'strict-origin-when-cross-origin',
  })(c, next)
})

// Webhook routes (no Clerk auth - uses Svix signature verification)
app.route('/api/webhooks', webhooks)

// Clerk auth middleware for all other routes
app.use('*', (c, next) => {
  const middleware = clerkMiddleware({
    publishableKey: c.env.VITE_CLERK_PUBLISHABLE_KEY,
    secretKey: c.env.CLERK_SECRET_KEY,
  })
  return middleware(c, next)
})
app.use('*', edgeCacheMiddleware)

const route = app //
  .basePath('/api')
  .get('/auth-status', (c) => {
    const auth = getAuth(c)
    return c.json({
      isAuthenticated: auth?.isAuthenticated ?? false,
      userId: auth?.userId ?? null,
      sessionId: auth?.sessionId ?? null,
    })
  })
  .route('/admin', adminApp)
  .route('/user', userApp)

export default app
export type AppType = typeof route
