import { describe, expect, it } from 'vitest';

import { CACHED_ROUTES } from '@/server/middleware/cache';

// [basePath, hasSubRoutes] - keep in sync with actual routes
const KNOWN_API_ROUTES = [
  // Admin routes
  ['/api/admin/dashboard', false],
  ['/api/admin/norms', false],
  ['/api/admin/accounts', true], // has /:userId
  ['/api/admin/users', true], // has /:userId

  // User routes (not cached at edge, uses KV or uncached)
  ['/api/user/record', true],
  ['/api/user/clerk/account', false],
  ['/api/user/clerk/profile', false],
  ['/api/user/clerk/menu', false],

  // Auth routes
  ['/api/auth-status', false],

  // Webhooks
  ['/api/webhooks/clerk', false],
] as const;

describe('Cache configuration validation', () => {
  it('should only cache existing API routes', () => {
    const knownPaths = KNOWN_API_ROUTES.map(([path]) => path) as string[];
    const knownPrefixes = KNOWN_API_ROUTES.filter(([, hasSub]) => hasSub).map(([path]) => path + '/');

    for (const [pattern, , isPrefix] of CACHED_ROUTES) {
      if (isPrefix) {
        // For prefix patterns, check if the base path exists
        const exists = knownPrefixes.some((p) => p.startsWith(pattern) || pattern.startsWith(p.slice(0, -1)));
        expect(exists, `Cache prefix "${pattern}" does not match any known route prefix`).toBe(true);
      } else {
        // For exact patterns, check if the path exists
        const exists = knownPaths.includes(pattern);
        expect(exists, `Cached path "${pattern}" does not exist in known routes`).toBe(true);
      }
    }
  });

  it('should have valid cache-control values', () => {
    const validCacheControlPattern = /^(public|private), max-age=\d+$/;

    for (const [pattern, cacheControl] of CACHED_ROUTES) {
      expect(cacheControl, `Invalid cache-control for "${pattern}"`).toMatch(validCacheControlPattern);
    }
  });

  it('should not have duplicate cache patterns', () => {
    const patterns = CACHED_ROUTES.map(([pattern, , isPrefix]) => (isPrefix ? `prefix:${pattern}` : pattern));
    const uniquePatterns = new Set(patterns);

    expect(patterns.length).toBe(uniquePatterns.size);
  });

  it('should use public cache for admin routes only', () => {
    for (const [pattern, cacheControl] of CACHED_ROUTES) {
      if (pattern.startsWith('/api/admin')) {
        expect(cacheControl, `Admin route "${pattern}" should use public cache`).toContain('public');
      } else if (pattern.startsWith('/api/user')) {
        expect(cacheControl, `User route "${pattern}" should use private cache`).toContain('private');
      }
    }
  });
});
