import { describe, test, expect } from 'bun:test';
import { ArkErrors } from 'arktype';
import {
  recordQuerySchema,
  createActivitySchema,
  deleteActivitiesSchema,
  paginationSchema,
  rankingQuerySchema,
} from '../index';

function isValid(result: unknown): boolean {
  return !(result instanceof ArkErrors);
}

describe('recordQuerySchema', () => {
  test('should accept empty object', () => {
    const result = recordQuerySchema({});
    expect(isValid(result)).toBe(true);
  });

  test('should accept valid userId format', () => {
    const result = recordQuerySchema({ userId: 'user_abcdefghijklmnopqrstuvwxyz1' });
    expect(isValid(result)).toBe(true);
  });

  test('should accept valid date formats', () => {
    const result = recordQuerySchema({
      startDate: '2024-01-01',
      endDate: '2024-12-31',
    });
    expect(isValid(result)).toBe(true);
  });

  test('should accept all valid fields together', () => {
    const result = recordQuerySchema({
      userId: 'user_abcdefghijklmnopqrstuvwxyz1',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
    });
    expect(isValid(result)).toBe(true);
  });

  test('should accept valid date formats', () => {
    const result = recordQuerySchema({
      startDate: '2024-01-01',
      endDate: '2024-12-31',
    });
    expect(isValid(result)).toBe(true);
  });

  test('should accept all valid fields together', () => {
    const result = recordQuerySchema({
      userId: 'user_abcdefghijklmnopqrstuvwxyz1',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
    });
    expect(isValid(result)).toBe(true);
  });

  test('should reject invalid userId format', () => {
    const result = recordQuerySchema({ userId: 'invalid' });
    expect(isValid(result)).toBe(false);
  });

  test('should reject userId without user_ prefix', () => {
    const result = recordQuerySchema({ userId: 'abcdefghijklmnopqrstuvwxyz1234567' });
    expect(isValid(result)).toBe(false);
  });

  test('should reject invalid date formats', () => {
    const result = recordQuerySchema({ startDate: '01-01-2024' });
    expect(isValid(result)).toBe(false);
  });

  test('should reject non-date strings', () => {
    const result = recordQuerySchema({ startDate: 'not-a-date' });
    expect(isValid(result)).toBe(false);
  });
});

describe('paginationSchema', () => {
  test('should accept valid page and perPage', () => {
    const result = paginationSchema({ page: 1, perPage: 10 });
    expect(isValid(result)).toBe(true);
  });

  test('should accept large valid values', () => {
    const result = paginationSchema({ page: 100, perPage: 100 });
    expect(isValid(result)).toBe(true);
  });

  test('should accept missing perPage', () => {
    const result = paginationSchema({ page: 1 });
    expect(isValid(result)).toBe(true);
  });

  test('should reject page=0', () => {
    const result = paginationSchema({ page: 0 });
    expect(isValid(result)).toBe(false);
  });

  test('should reject negative page', () => {
    const result = paginationSchema({ page: -1 });
    expect(isValid(result)).toBe(false);
  });

  test('should reject perPage > 100', () => {
    const result = paginationSchema({ page: 1, perPage: 101 });
    expect(isValid(result)).toBe(false);
  });

  test('should reject perPage < 1', () => {
    const result = paginationSchema({ page: 1, perPage: 0 });
    expect(isValid(result)).toBe(false);
  });

  test('should reject missing page', () => {
    const result = paginationSchema({});
    expect(isValid(result)).toBe(false);
  });
});

describe('rankingQuerySchema', () => {
  test('should accept empty object', () => {
    const result = rankingQuerySchema({});
    expect(isValid(result)).toBe(true);
  });

  test('should accept valid year', () => {
    const result = rankingQuerySchema({ year: 2024 });
    expect(isValid(result)).toBe(true);
  });

  test('should accept boundary years', () => {
    expect(isValid(rankingQuerySchema({ year: 1900 }))).toBe(true);
    expect(isValid(rankingQuerySchema({ year: 2099 }))).toBe(true);
  });

  test('should accept valid month', () => {
    const result = rankingQuerySchema({ month: 6 });
    expect(isValid(result)).toBe(true);
  });

  test('should accept boundary months', () => {
    expect(isValid(rankingQuerySchema({ month: 1 }))).toBe(true);
    expect(isValid(rankingQuerySchema({ month: 12 }))).toBe(true);
  });

  test('should accept valid period values', () => {
    expect(isValid(rankingQuerySchema({ period: 'monthly' }))).toBe(true);
    expect(isValid(rankingQuerySchema({ period: 'annual' }))).toBe(true);
    expect(isValid(rankingQuerySchema({ period: 'fiscal' }))).toBe(true);
  });

  test('should reject invalid year (1899)', () => {
    const result = rankingQuerySchema({ year: 1899 });
    expect(isValid(result)).toBe(false);
  });

  test('should reject invalid year (2100)', () => {
    const result = rankingQuerySchema({ year: 2100 });
    expect(isValid(result)).toBe(false);
  });

  test('should reject invalid month (0)', () => {
    const result = rankingQuerySchema({ month: 0 });
    expect(isValid(result)).toBe(false);
  });

  test('should reject invalid month (13)', () => {
    const result = rankingQuerySchema({ month: 13 });
    expect(isValid(result)).toBe(false);
  });

  test('should reject invalid period string', () => {
    const result = rankingQuerySchema({ period: 'weekly' });
    expect(isValid(result)).toBe(false);
  });
});

describe('deleteActivitiesSchema', () => {
  test('should accept valid ids array', () => {
    const result = deleteActivitiesSchema({ ids: ['a', 'b'] });
    expect(isValid(result)).toBe(true);
  });

  test('should accept empty ids array', () => {
    const result = deleteActivitiesSchema({ ids: [] });
    expect(isValid(result)).toBe(true);
  });

  test('should reject non-array ids', () => {
    const result = deleteActivitiesSchema({ ids: 'not-array' });
    expect(isValid(result)).toBe(false);
  });

  test('should reject missing ids', () => {
    const result = deleteActivitiesSchema({});
    expect(isValid(result)).toBe(false);
  });

  test('should reject array with non-string elements', () => {
    const result = deleteActivitiesSchema({ ids: [1, 2] });
    expect(isValid(result)).toBe(false);
  });
});

describe('createActivitySchema', () => {
  test('should accept valid date and period', () => {
    const result = createActivitySchema({ date: '2024-01-01', period: 1.5 });
    expect(isValid(result)).toBe(true);
  });

  test('should accept YYYY-MM-DD date format only', () => {
    const result = createActivitySchema({ date: '1999-12-31', period: 2 });
    expect(isValid(result)).toBe(true);
  });

  test('should reject missing date', () => {
    const result = createActivitySchema({ period: 1.5 });
    expect(isValid(result)).toBe(false);
  });

  test('should reject missing period', () => {
    const result = createActivitySchema({ date: '2024-01-01', period: 0 });
    expect(isValid(result)).toBe(false);
  });

  test('should reject non-positive period', () => {
    const result = createActivitySchema({ date: '2024-01-01', period: -1 });
    expect(isValid(result)).toBe(false);
  });

  test('should accept valid date string', () => {
    const result = createActivitySchema({ date: '2024-01-01', period: 1.5 });
    expect(isValid(result)).toBe(true);
  });

  test('should reject date without zero padding', () => {
    const result = createActivitySchema({ date: '2024-1-1', period: 1.5 });
    expect(isValid(result)).toBe(false);
  });

  test('should reject date with slash separator', () => {
    const result = createActivitySchema({ date: '2024/01/01', period: 1.5 });
    expect(isValid(result)).toBe(false);
  });

  test('should reject non-date string', () => {
    const result = createActivitySchema({ date: 'hello', period: 1.5 });
    expect(isValid(result)).toBe(false);
  });
});
