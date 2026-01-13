import { createClerkClient } from '@clerk/backend';
import { arktypeValidator } from '@hono/arktype-validator';
import { getAuth } from '@hono/clerk-auth';
import { type } from 'arktype';
import * as drizzleOrm from 'drizzle-orm';
import { Hono } from 'hono';

import { dbClient } from '@/server/db/drizzle';
import { activity } from '@/server/db/schema';
import { Role } from '@/share/types/role';

import * as helpers from './helpers';

// ============================================================
// Helper Functions
// ============================================================

const getUserActivitySummary = (env: Env, userId: string) => {
  const db = dbClient(env);
  return db
    .select()
    .from(activity)
    .where(drizzleOrm.eq(activity.userId, userId))
    .orderBy(drizzleOrm.desc(activity.date));
};

const getMonthlyRanking = (env: Env) => {
  const db = dbClient(env);
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0, 23, 59, 59);

  const startDateStr = startDate.toISOString().split('T')[0]!;
  const endDateStr = endDate.toISOString().split('T')[0]!;

  return db
    .select({
      userId: activity.userId,
      total: drizzleOrm.sql<number>`SUM(${activity.period})`,
    })
    .from(activity)
    .where(drizzleOrm.and(drizzleOrm.gte(activity.date, startDateStr), drizzleOrm.lte(activity.date, endDateStr)))
    .groupBy(activity.userId)
    .orderBy(drizzleOrm.desc(drizzleOrm.sql<number>`SUM(${activity.period})`))
    .limit(5);
};

// ============================================================
// Routes
// ============================================================

const app = new Hono<{ Bindings: Env }>()
  // List all users (from accounts.ts)
  .get('/', arktypeValidator('query', helpers.accountsQuerySchema), async (c) => {
    const clerkClient = createClerkClient({
      secretKey: c.env.CLERK_SECRET_KEY,
    });

    const { query, limit } = c.req.valid('query');
    const userLimit = Number(limit ?? 20);

    const clerkUsers = await clerkClient.users.getUserList({
      limit: userLimit,
      query: query ?? '',
      orderBy: 'created_at',
    });

    const users = clerkUsers.data.map(helpers.toAdminUser);
    const ranking = await getMonthlyRanking(c.env);

    return c.json({ users, query: query ?? '', ranking });
  })

  // Get single user details
  .get('/:userId', arktypeValidator('query', helpers.userActivitiesQuerySchema), async (c) => {
    const userId = c.req.param('userId');
    const { page: rawPage, limit: rawLimit } = c.req.valid('query');
    const page = Number(rawPage ?? 1);
    const limit = Number(rawLimit ?? 10);

    const clerkClient = createClerkClient({
      secretKey: c.env.CLERK_SECRET_KEY,
    });

    try {
      const clerkUser = await clerkClient.users.getUser(userId);
      const user = helpers.toAdminUser(clerkUser);

      const profileParse = helpers.publicMetadataProfileSchema(helpers.coerceProfileMetadata(clerkUser.publicMetadata));
      const profile = profileParse instanceof type.errors ? null : { ...profileParse, id: clerkUser.id };

      const allActivities = await getUserActivitySummary(c.env, userId);
      const totalActivitiesCount = allActivities.length;
      const activities = allActivities.slice((page - 1) * limit, page * limit);
      const totalHours = allActivities.reduce((sum, a) => sum + (a.period || 0), 0);
      const totalDays = new Set(allActivities.map((a) => a.date)).size;

      const getGradeAtDate = profile?.getGradeAt
        ? new Date(profile.getGradeAt)
        : helpers.getJST(new Date(profile?.joinedAt ?? new Date().getFullYear()));

      const trainsAfterGrade = allActivities
        .filter((a) => new Date(a.date) > getGradeAtDate)
        .map((a) => a.period)
        .reduce((sum, period) => sum + period, 0);

      const trainCount = Math.floor(allActivities.map((a) => a.period).reduce((sum, val) => sum + val, 0) / 1.5);
      const doneTrain = Math.floor(trainsAfterGrade / 1.5);

      return c.json({
        user,
        profile,
        activities,
        trainCount,
        doneTrain,
        page,
        totalActivitiesCount,
        limit,
        totalDays,
        totalEntries: totalActivitiesCount,
        totalHours,
      });
    } catch (e) {
      console.error(e);
      return c.json({ error: 'User not found' }, 404);
    }
  })

  // Update user profile
  .patch('/:userId/profile', arktypeValidator('json', helpers.adminProfileUpdateSchema), async (c) => {
    const auth = getAuth(c);
    if (!auth?.userId) return c.json({ error: '認証されていません' }, 401);

    const targetUserId = c.req.param('userId');
    const parsed = c.req.valid('json');
    const { year, grade, role, joinedAt } = parsed;

    const currentYear = new Date().getFullYear();
    const minJoinedAt = currentYear - 4;
    const maxJoinedAt = currentYear + 1;
    if (joinedAt < minJoinedAt || joinedAt > maxJoinedAt) {
      return c.json(
        {
          error: `入部年度は${minJoinedAt}年から${maxJoinedAt}年の間で入力してください`,
        },
        400
      );
    }

    const clerkClient = createClerkClient({
      secretKey: c.env.CLERK_SECRET_KEY,
    });

    const adminUser = await clerkClient.users.getUser(auth.userId);
    const adminProfileParse = helpers.publicMetadataProfileSchema(
      helpers.coerceProfileMetadata(adminUser.publicMetadata)
    );
    const adminProfile = adminProfileParse instanceof type.errors ? null : adminProfileParse;
    const adminRole = adminProfile?.role ? Role.fromString(adminProfile.role) : null;

    if (!adminRole?.isManagement()) {
      return c.json({ error: '権限が不足しています' }, 403);
    }

    const targetUser = await clerkClient.users.getUser(targetUserId);
    const targetProfileParsed = helpers.publicMetadataProfileSchema(
      helpers.coerceProfileMetadata(targetUser.publicMetadata)
    );
    const targetCurrentRole =
      targetProfileParsed instanceof type.errors
        ? Role.MEMBER
        : (Role.fromString(targetProfileParsed.role ?? 'member') ?? Role.MEMBER);

    if (targetCurrentRole && Role.compare(adminRole.role, targetCurrentRole.role) > 0) {
      return c.json({ error: '現在の権限より上書きできません' }, 403);
    }

    const requestedRole = Role.fromString(role);
    if (!requestedRole || Role.compare(adminRole.role, requestedRole.role) > 0) {
      return c.json({ error: '権限が不足しています' }, 403);
    }

    const normalizedGetGradeAt = parsed.getGradeAt && parsed.getGradeAt !== 'null' ? new Date(parsed.getGradeAt) : null;
    if (normalizedGetGradeAt && isNaN(normalizedGetGradeAt.getTime())) {
      return c.json({ error: '級段位取得日の形式が正しくありません' }, 400);
    }

    const updatedMetadata = {
      grade,
      getGradeAt: normalizedGetGradeAt ? helpers.formatDateToJSTString(normalizedGetGradeAt) : null,
      joinedAt,
      year,
      role,
    };

    await clerkClient.users.updateUserMetadata(targetUserId, {
      publicMetadata: updatedMetadata,
    });

    return c.json({ success: true, updatedMetadata }, 200);
  })

  // Delete user
  .delete('/:userId', async (c) => {
    const auth = getAuth(c);
    if (!auth?.userId) return c.json({ error: '認証されていません' }, 401);

    const targetUserId = c.req.param('userId');

    if (auth.userId === targetUserId) {
      return c.json({ error: '自分自身を削除することはできません' }, 400);
    }

    const clerkClient = createClerkClient({
      secretKey: c.env.CLERK_SECRET_KEY,
    });

    const adminUser = await clerkClient.users.getUser(auth.userId);
    const adminProfileParse = helpers.publicMetadataProfileSchema(
      helpers.coerceProfileMetadata(adminUser.publicMetadata)
    );
    const adminProfile = adminProfileParse instanceof type.errors ? null : adminProfileParse;
    const adminRole = adminProfile?.role ? Role.fromString(adminProfile.role) : null;

    if (!adminRole?.isManagement()) {
      return c.json({ error: '権限が不足しています' }, 403);
    }

    try {
      const targetUser = await clerkClient.users.getUser(targetUserId);
      const targetProfileParsed = helpers.publicMetadataProfileSchema(
        helpers.coerceProfileMetadata(targetUser.publicMetadata)
      );
      const targetRole =
        targetProfileParsed instanceof type.errors
          ? Role.MEMBER
          : (Role.fromString(targetProfileParsed.role ?? 'member') ?? Role.MEMBER);

      if (Role.compare(adminRole.role, targetRole.role) >= 0) {
        return c.json({ error: '自分以上の権限を持つユーザーは削除できません' }, 403);
      }

      await clerkClient.users.deleteUser(targetUserId);
      return c.json({ success: true }, 200);
    } catch (e) {
      console.error('Failed to delete user:', e);
      return c.json({ error: 'ユーザーの削除に失敗しました' }, 500);
    }
  });

export default app;
