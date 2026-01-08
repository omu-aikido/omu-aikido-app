import { Hono } from 'hono'

import { ensureSignedIn } from '@/server/middleware/signedIn'

import { clerk } from './clerk'
import { record } from './record'

const userApp = new Hono<{ Bindings: Env }>() //
  .use('*', ensureSignedIn) //
  .route('/record', record) //
  .route('/clerk', clerk) //

export default userApp
