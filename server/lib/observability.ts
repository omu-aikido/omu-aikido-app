import type { Context } from 'hono';

/**
 * Cloudflare Workers Observabilityに対応したエラー通知
 * console.errorで出力されたログはCloudflare Dashboardで確認可能
 */
export function notify(c: Context, error: Error, metadata?: Record<string, unknown>) {
  const errorLog = {
    level: 'error',
    message: `${c.req.method} ${c.req.url}`,
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
    request: {
      method: c.req.method,
      url: c.req.url,
      path: c.req.path,
      headers: {
        'user-agent': c.req.header('user-agent'),
        'cf-ray': c.req.header('cf-ray'),
        'cf-connecting-ip': c.req.header('cf-connecting-ip'),
      },
    },
    metadata,
    timestamp: new Date().toISOString(),
  };

  if (!metadata) {
    console.warn(JSON.stringify(errorLog));
    return;
  }

  const rawStatus = (metadata as { statusCode?: unknown }).statusCode;
  if (typeof rawStatus !== 'number') {
    console.error(JSON.stringify(errorLog));
    return;
  }

  const logFn = rawStatus >= 500 ? console.error : console.warn;
  logFn(JSON.stringify(errorLog));
}
