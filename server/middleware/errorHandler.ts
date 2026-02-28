import type { Context, Next } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { notifyError } from '../lib/observability';

export async function errorHandler(c: Context, next: Next): Promise<Response> {
  try {
    await next();
    return c.res;
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));

    // HTTPExceptionの場合はそのまま返す
    if (err instanceof HTTPException) {
      return err.getResponse();
    }

    // Cloudflare Workers Observabilityにエラーを通知
    notifyError(c, error, {
      statusCode: 500,
      errorType: error.constructor.name,
    });

    // 500エラーを返す
    return c.json(
      {
        error: 'Internal Server Error',
        message: error.message,
      },
      500,
    );
  }
}
