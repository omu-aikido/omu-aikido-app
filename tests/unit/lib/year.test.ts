import { describe, it, expect } from 'vitest';

import { translateYear } from '../../../share/lib/year';

describe('share/lib/year', () => {
  describe('translateYear', () => {
    it('translates year codes correctly', () => {
      expect(translateYear('b1')).toBe('1回生');
      expect(translateYear('b4')).toBe('4回生');
      expect(translateYear('m1')).toBe('修士1年');
      expect(translateYear('d2')).toBe('博士2年');
    });

    it('is case insensitive for codes', () => {
      expect(translateYear('B1')).toBe('1回生');
      expect(translateYear('M1')).toBe('修士1年');
    });

    it('returns label if name is passed', () => {
      expect(translateYear('1回生')).toBe('1回生');
      expect(translateYear('修士1年')).toBe('修士1年');
    });

    it('translates UI labels correctly', () => {
      expect(translateYear('学部 1年')).toBe('1回生');
      expect(translateYear('学部 4年')).toBe('4回生');
      expect(translateYear('修士 1年')).toBe('修士1年');
      expect(translateYear('博士 2年')).toBe('博士2年');
    });

    it('returns "不明" for invalid inputs', () => {
      expect(translateYear('invalid')).toBe('不明');
      expect(translateYear('')).toBe('不明');
      // @ts-ignore
      expect(translateYear(null)).toBe('不明');
      // @ts-ignore
      expect(translateYear(undefined)).toBe('不明');
    });
  });
});
