import { drizzle } from "drizzle-orm/libsql/web"
import { createClient } from "@libsql/client/web"

const client = createClient({
  url:
    import.meta.env.NODE_ENV === "development"
      ? "http://127.0.0.1:8080"
      : import.meta.env.TURSO_DATABASE_URL!,
  authToken: import.meta.env.TURSO_AUTH_TOKEN,
})

export const db = drizzle({ client })
