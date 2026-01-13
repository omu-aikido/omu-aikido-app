import { arktypeValidator } from '@hono/arktype-validator';
import { getAuth } from '@hono/clerk-auth';
import * as drizzleOrm from 'drizzle-orm';
import { Hono } from 'hono';

import { dbClient } from '@/server/db/drizzle';
import { activity } from '@/server/db/schema';
import * as records from '@/share/types/records';

import { calculatePeriodRange, getRankingData, invalidateRankingCache, maskRankingData } from './ranking';

export const record = new Hono<{ Bindings: Env }>()
  // GET /api/user/record - 活動記録一覧取得
  .get(
    '/',
    arktypeValidator('query', records.recordQuerySchema, (result, c) => {
      if (!result.success) {
        return c.json({ error: 'Invalid Query' }, 400);
      }
      return;
    }),
    async (c) => {
      const auth = getAuth(c);
      if (!auth || !auth.userId) return c.json({ error: 'Unauthorized' }, 401);

      const query = c.req.valid('query');
      const userId = query.userId ?? auth.userId;

      if (userId !== auth.userId) {
        return c.json({ error: 'Forbidden' }, 403);
      }

      const db = dbClient(c.env);
      const conditions = [drizzleOrm.eq(activity.userId, userId)];
      if (query.startDate) conditions.push(drizzleOrm.gte(activity.date, query.startDate));
      if (query.endDate) conditions.push(drizzleOrm.lte(activity.date, query.endDate));

      const activities = await db
        .select()
        .from(activity)
        .where(drizzleOrm.and(...conditions))
        .orderBy(drizzleOrm.desc(activity.date));

      return c.json({ activities }, 200);
    }
  )

  // POST /api/user/record - 活動記録作成
  .post(
    '/',
    arktypeValidator('json', records.createActivitySchema, (result, c) => {
      if (!result.success) {
        return c.json({ error: 'Invalid Activity Data' }, 400);
      }
      return;
    }),
    async (c) => {
      const auth = getAuth(c);
      if (!auth || !auth.userId) return c.json({ error: 'Unauthorized' }, 401);

      const body = c.req.valid('json');
      const db = dbClient(c.env);
      const now = new Date().toISOString();

      await db.insert(activity).values({
        id: crypto.randomUUID(),
        userId: auth.userId,
        date: body.date,
        period: body.period ?? 1.5,
        createAt: now,
        updatedAt: now,
      });

      c.executionCtx.waitUntil(invalidateRankingCache(body.date));

      return c.json({ success: true }, 201);
    }
  )

  // DELETE /api/user/record - 活動記録削除
  .delete(
    '/',
    arktypeValidator('json', records.deleteActivitiesSchema, (result, c) => {
      if (!result.success) {
        return c.json({ error: 'Invalid Delete Request' }, 400);
      }
      return;
    }),
    async (c) => {
      const auth = getAuth(c);
      if (!auth || !auth.userId) return c.json({ error: 'Unauthorized' }, 401);

      const body = c.req.valid('json');
      const db = dbClient(c.env);

      const deleted = await db
        .delete(activity)
        .where(drizzleOrm.and(drizzleOrm.inArray(activity.id, body.ids), drizzleOrm.eq(activity.userId, auth.userId)))
        .returning({ date: activity.date });

      const deletedDates = [...new Set(deleted.map((d) => d.date))];
      c.executionCtx.waitUntil(Promise.all(deletedDates.map((date) => invalidateRankingCache(date))));

      return c.json({ success: true }, 200);
    }
  )

  // GET /api/user/record/count - 稽古回数取得
  .get('/count', async (c) => {
    const auth = getAuth(c);
    if (!auth || !auth.userId) return c.json({ error: 'Unauthorized' }, 401);

    const db = dbClient(c.env);

    const { getProfile } = await import('@/server/clerk/profile');
    const profile = await getProfile(c);

    const startDate = profile?.getGradeAt || '1970-01-01';

    const result = await db
      .select({
        totalPeriod: drizzleOrm.sql<number>`COALESCE(SUM(${activity.period}), 0)`,
      })
      .from(activity)
      .where(drizzleOrm.and(drizzleOrm.eq(activity.userId, auth.userId), drizzleOrm.gte(activity.date, startDate)));

    const totalPeriod = result[0]?.totalPeriod || 0;

    const practiceCount = Math.floor(totalPeriod / 1.5);

    return c.json({ practiceCount, totalPeriod, since: startDate }, 200);
  })

  // POST /api/user/record/page - ページネーション付き記録取得
  .post(
    '/page',
    arktypeValidator('json', records.paginationSchema, (result, c) => {
      if (!result.success) {
        return c.json({ error: 'Invalid Pagination Data' }, 400);
      }
      return;
    }),
    async (c) => {
      const auth = getAuth(c);
      if (!auth || !auth.userId) return c.json({ error: 'Unauthorized' }, 401);

      const body = c.req.valid('json');
      const page = body.page;
      const perPage = body.perPage ?? 20;
      const offset = (page - 1) * perPage;

      const db = dbClient(c.env);

      // 総件数を取得
      const countResult = await db
        .select({ total: drizzleOrm.sql<number>`COUNT(*)` })
        .from(activity)
        .where(drizzleOrm.eq(activity.userId, auth.userId));

      const total = countResult[0]?.total || 0;
      const totalPages = Math.ceil(total / perPage);

      // ページネーション付きデータを取得
      const activities = await db
        .select()
        .from(activity)
        .where(drizzleOrm.eq(activity.userId, auth.userId))
        .orderBy(drizzleOrm.desc(activity.date))
        .limit(perPage)
        .offset(offset);

      return c.json({ activities, pagination: { page, perPage, total, totalPages } }, 200);
    }
  )

  // GET /api/user/record/ranking - キャッシュ最適化されたランキング取得
  .get(
    '/ranking',
    arktypeValidator('query', records.rankingQuerySchema, (result, c) => {
      if (!result.success) {
        return c.json({ error: 'Invalid Query Parameters' }, 400);
      }
      return;
    }),
    async (c) => {
      const auth = getAuth(c);
      if (!auth || !auth.userId) return c.json({ error: 'Unauthorized' }, 401);

      const query = c.req.valid('query');

      // JST (UTC+9) で現在時刻を取得
      const utcNow = new Date();
      const jstNow = new Date(utcNow.getTime() + 9 * 60 * 60 * 1000);
      const targetYear = query.year ?? jstNow.getUTCFullYear();
      const targetMonth = query.month ?? jstNow.getUTCMonth() + 1;
      const period = (query.period ?? 'monthly') as 'monthly' | 'annual' | 'fiscal';

      // 日付範囲の算出
      const { startDate, endDate, periodLabel } = calculatePeriodRange({
        year: targetYear,
        month: targetMonth,
        period,
      });

      // Edge Cacheからランキングデータを取得（キャッシュミス時はDBから取得してキャッシュ）
      const rawRankingData = await getRankingData(c, startDate, endDate);

      // ユーザーIDでマスク処理
      const ranking = maskRankingData(rawRankingData, auth.userId);
      const currentUserRanking = ranking.find((entry) => entry.isCurrentUser) ?? null;

      return c.json(
        {
          period: periodLabel,
          periodType: period,
          startDate,
          endDate,
          ranking,
          currentUserRanking,
          totalUsers: ranking.length,
        },
        200
      );
    }
  );
