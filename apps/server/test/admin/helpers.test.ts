import { describe, expect, test } from 'bun:test';
import { isDoneTrainTargetDate, resolveTrainBaselineDate } from '../../src/app/admin/helpers';

describe('resolveTrainBaselineDate', () => {
  test('joinedAt only: uses April 1st of joined year as baseline', () => {
    const baseline = resolveTrainBaselineDate({ joinedAt: 2024 });
    expect(baseline.toISOString()).toBe('2024-04-01T00:00:00.000Z');
  });

  test('getGradeAt has priority over joinedAt', () => {
    const baseline = resolveTrainBaselineDate({ getGradeAt: '2025-06-15', joinedAt: 2020 });
    expect(baseline.toISOString()).toBe('2025-06-15T00:00:00.000Z');
  });

  test('doneTrain boundary: baseline date itself is included', () => {
    const baseline = resolveTrainBaselineDate({ getGradeAt: '2024-04-01' });
    expect(isDoneTrainTargetDate('2024-04-01', baseline)).toBe(true);
    expect(isDoneTrainTargetDate('2024-03-31', baseline)).toBe(false);
  });
});
