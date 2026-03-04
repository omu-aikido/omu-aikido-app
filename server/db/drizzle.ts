import { drizzle } from 'drizzle-orm/libsql/web';

export const dbClient = (env: Env) => {
  return drizzle({
    connection: {
      url: env.TURSO_DATABASE_URL,
      authToken: env.TURSO_AUTH_TOKEN,
    },
  });
};