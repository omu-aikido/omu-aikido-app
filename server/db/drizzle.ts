import { createClient } from '@libsql/client/web'
import { drizzle } from 'drizzle-orm/libsql/web'

export const dbClient = (env: Env) => {
  const client = createClient({
    url: env.TURSO_DATABASE_URL,
    authToken: env.TURSO_AUTH_TOKEN,
  })

  return drizzle({ client })
}
