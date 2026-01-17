import { type } from 'arktype';

/**
 * 管理者API向けのユーザー情報型定義
 * ClerkのUserオブジェクトから必要な情報を抽出した形式
 */
export const AdminUser = type({
  id: 'string',
  firstName: 'string | null',
  lastName: 'string | null',
  imageUrl: 'string',
  emailAddress: 'string | null',
  profile: type({
    role: 'string',
    roleLabel: 'string',
    grade: 'number',
    gradeLabel: 'string',
    year: 'string',
    yearLabel: 'string',
    joinedAt: 'number | null',
    getGradeAt: 'string | null',
  }),
});

export type AdminUserType = typeof AdminUser.infer;
