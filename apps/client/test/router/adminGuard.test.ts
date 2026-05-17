import { describe, expect, test } from 'bun:test';

import { isAdminRole } from '../../src/router/adminGuard';

describe('router admin guard role handling', () => {
  test('returns true for management role', () => {
    expect(isAdminRole('admin')).toBe(true);
  });

  test('returns false for member role', () => {
    expect(isAdminRole('member')).toBe(false);
  });

  test('returns false for unknown role', () => {
    expect(isAdminRole('unknown')).toBe(false);
  });
});
