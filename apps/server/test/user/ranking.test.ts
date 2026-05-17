import { describe, expect, test } from 'bun:test';

import { maskRankingData } from '../../src/app/user/ranking';

describe('maskRankingData', () => {
  test('keeps competition ranking behavior on ties', () => {
    const ranking = [
      { userId: 'user_1', totalPeriod: 15 },
      { userId: 'user_2', totalPeriod: 15 },
      { userId: 'user_3', totalPeriod: 10 },
    ];

    const masked = maskRankingData(ranking, 'user_2');

    expect(masked[0]?.rank).toBe(1);
    expect(masked[1]?.rank).toBe(1);
    expect(masked[2]?.rank).toBe(3);
  });

  test('keeps expected rank for users beyond top-50 context slice', () => {
    const ranking = Array.from({ length: 60 }, (_, i) => ({
      userId: `user_${i + 1}`,
      totalPeriod: 200 - i,
    }));

    const masked = maskRankingData(ranking, 'user_57');
    const currentUser = masked.find((entry) => entry.isCurrentUser);

    expect(currentUser?.rank).toBe(57);
  });

  test('keeps mask policy and only reveals current user', () => {
    const topRanking = [
      { userId: 'user_admin', totalPeriod: 18 },
      { userId: 'user_me', totalPeriod: 12 },
      { userId: 'user_other', totalPeriod: 9 },
    ];

    const masked = maskRankingData(topRanking, 'user_me');

    expect(masked[0]?.userName).toBe('匿名');
    expect(masked[1]?.userName).toBe('あなた');
    expect(masked[2]?.userName).toBe('匿名');
    expect(masked[1]?.isCurrentUser).toBe(true);
  });
});
