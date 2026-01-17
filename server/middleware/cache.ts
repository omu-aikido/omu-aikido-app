import type { Context, Next } from 'hono';

// [pathPattern, cacheControl, isPrefix]
export const CACHED_ROUTES: Array<[string, string, boolean]> = [
  // Admin routes (public cache - all admin users see same data)
  ['/api/admin/dashboard', 'public, max-age=60', false],
  ['/api/admin/norms', 'public, max-age=60', false],
  ['/api/admin/accounts', 'public, max-age=30', false],
  ['/api/admin/users', 'public, max-age=30', false],
  ['/api/admin/accounts/', 'public, max-age=30', true],
  ['/api/admin/users/', 'public, max-age=30', true],
];

const getCacheControlForPath = (path: string): string | null => {
  for (const [pattern, cacheControl, isPrefix] of CACHED_ROUTES) {
    if (isPrefix ? path.startsWith(pattern) : path === pattern) {
      return cacheControl;
    }
  }
  return null;
};

export const edgeCacheMiddleware = async (c: Context, next: Next): Promise<Response | void> => {
  if (c.req.method !== 'GET') {
    await next();
    return;
  }

  const cacheControl = getCacheControlForPath(c.req.path);
  if (!cacheControl) {
    await next();
    return;
  }

  const cache = (caches as unknown as { default: Cache }).default;
  const cacheKey = new Request(new URL(c.req.url).toString(), {
    method: 'GET',
  });

  const cached = await cache.match(cacheKey);
  if (cached) {
    return cached;
  }

  await next();

  const response = c.res;
  if (!response.ok) return;
  if (response.headers.has('Set-Cookie')) return;

  response.headers.set('Cache-Control', cacheControl);
  c.executionCtx.waitUntil(cache.put(cacheKey, response.clone()));
};
