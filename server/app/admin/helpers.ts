import type { User } from '@clerk/backend';

import { ArkErrors, type } from 'arktype';

import { translateGrade } from '@/share/lib/grade';
import { translateYear } from '@/share/lib/year';
import { AdminUser, type AdminUserType } from '@/share/types/admin';
import { Role } from '@/share/types/role';

// ============================================================
// Schemas
// ============================================================

export const accountsQuerySchema = type({
  'query?': 'string',
  'limit?': 'string | number',
  'page?': 'string | number',
  'sortBy?': 'string',
  'sortOrder?': "'asc' | 'desc'",
});

export const userActivitiesQuerySchema = type({
  'page?': 'string | number',
  'limit?': 'string | number',
});

export const adminProfileUpdateSchema = type({
  year: 'string',
  grade: 'number',
  role: 'string',
  joinedAt: 'number',
  'getGradeAt?': 'string | null',
});

export const publicMetadataProfileSchema = type({
  'role?': 'string',
  'grade?': 'number | string',
  'joinedAt?': 'number',
  'year?': 'string',
  'getGradeAt?': 'string | null',
});

// ============================================================
// User Conversion
// ============================================================

export function toAdminUser(user: User): AdminUserType {
  const meta = user.publicMetadata as Record<string, unknown> | undefined;

  const roleStr = typeof meta?.role === 'string' ? meta.role : 'member';
  const roleObj = Role.fromString(roleStr);

  const gradeRaw = meta?.grade;
  const grade =
    typeof gradeRaw === 'number' ? gradeRaw : typeof gradeRaw === 'string' ? parseInt(gradeRaw, 10) || 0 : 0;

  const yearStr = typeof meta?.year === 'string' ? meta.year : '';
  const joinedAt = typeof meta?.joinedAt === 'number' ? meta.joinedAt : null;
  const getGradeAt = typeof meta?.getGradeAt === 'string' ? meta.getGradeAt : null;

  const res = AdminUser({
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    imageUrl: user.imageUrl,
    emailAddress: user.emailAddresses[0]?.emailAddress ?? null,
    profile: {
      role: roleStr,
      roleLabel: roleObj?.ja ?? roleStr,
      grade,
      gradeLabel: translateGrade(grade),
      year: yearStr,
      yearLabel: translateYear(yearStr),
      joinedAt,
      getGradeAt,
    },
  });

  if (res instanceof ArkErrors) {
    throw new TypeError(`Failed to convert user`);
  }
  return res;
}

export function coerceProfileMetadata(metadata: unknown) {
  if (!metadata || typeof metadata !== 'object') return {};
  return metadata;
}

// ============================================================
// Date Utilities
// ============================================================

export function getJST(date: Date): Date {
  return new Date(date.getTime() + 9 * 60 * 60 * 1000);
}

export function formatDateToJSTString(date: Date): string {
  const jstDate = getJST(date);
  return jstDate.toISOString().split('T')[0]!;
}
