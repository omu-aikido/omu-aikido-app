import { hc } from 'hono/client'

import type { AppType } from '@/server'
const honoClient = hc<AppType>('/', { init: { credentials: 'include' } }).api

export default honoClient
