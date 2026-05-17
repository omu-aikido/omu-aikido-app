import { describe, expect, test } from 'bun:test';

import { calculateCompetitionRank, maskRankingData } from './ranking';

describe('calculateCompetitionRank', () => {
  test('returns rank when user is outside top 50 source slice context', () => {
    const fullRanking = Array.from({ length: 60 }, (_, i) => ({
      userId: `user_${i + 1}`,
      totalPeriod: 200 - i,
    }));

    const rank = calculateCompetitionRank(fullRanking, 'user_57');

    expect(rank).toBe(57);
  });

  test('returns null when user has no record in ranking source', () => {
    const fullRanking = [
      { userId: 'user_1', totalPeriod: 12 },
      { userId: 'user_2', totalPeriod: 10 },
    ];

    const rank = calculateCompetitionRank(fullRanking, 'user_absent');

    expect(rank).toBeNull();
  });

  test('keeps competition ranking behavior on ties', () => {
    const fullRanking = [
      { userId: 'user_1', totalPeriod: 15 },
      { userId: 'user_2', totalPeriod: 15 },
      { userId: 'user_3', totalPeriod: 10 },
    ];

    expect(calculateCompetitionRank(fullRanking, 'user_1')).toBe(1);
    expect(calculateCompetitionRank(fullRanking, 'user_2')).toBe(1);
    expect(calculateCompetitionRank(fullRanking, 'user_3')).toBe(3);
  });
});

describe('maskRankingData', () => {
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
