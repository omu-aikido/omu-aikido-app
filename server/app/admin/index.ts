import { Hono } from 'hono';

import { ensureAdmin } from '@/server/middleware/admin';

import statsApp from './stats';
import usersApp from './users';

const adminApp = new Hono<{ Bindings: Env }>()
  .use('*', ensureAdmin)
  .route('/', statsApp)
  .route('/accounts', usersApp)
  .route('/users', usersApp);

export default adminApp;
