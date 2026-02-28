import type { Context, Next } from 'hono';

export async function requestLogger(c: Context, next: Next): Promise<void | Response> {
  const start = Date.now();

  await next();

  const duration = Date.now() - start;
  const status = c.res.status;

  // ステータスコードに応じてログレベルを変更
  const level = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info';

  console.log({
    level,
    message: `${c.req.method} ${c.req.url}`,
    request: {
      method: c.req.method,
      url: c.req.url,
      path: c.req.path,
      query: c.req.query(),
    },
    response: {
      status,
      duration: `${duration}ms`,
    },
  });
}
