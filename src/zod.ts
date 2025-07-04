import { z } from "zod"
export class Role {
  constructor(
    // roleType から取得
    public role: string,
    public ja: string,
  ) {}

  static readonly ADMIN = new Role("admin", "管理者")
  static readonly CAPTAIN = new Role("captain", "主将")
  static readonly VICE_CAPTAIN = new Role("vice-captain", "副主将")
  static readonly TREASURER = new Role("treasurer", "会計")
  static readonly MEMBER = new Role("member", "部員")

  static readonly ALL = [Role.ADMIN, Role.CAPTAIN, Role.VICE_CAPTAIN, Role.TREASURER, Role.MEMBER]

  static fromString(role: string): Role | null {
    switch (role) {
      case "admin":
        return Role.ADMIN
      case "captain":
        return Role.CAPTAIN
      case "vice-captain":
        return Role.VICE_CAPTAIN
      case "treasurer":
        return Role.TREASURER
      case "member":
        return Role.MEMBER
      default:
        return null
    }
  }

  toString(): string {
    return this.role
  }

  isManagement(): boolean {
    return this !== Role.MEMBER
  }

  static type() {
    return z.enum(["admin", "captain", "vice-captain", "treasurer", "member"])
  }

  // ソート用
  static compare(a: string, b: string): number {
    const roleA = Role.fromString(a) ?? Role.MEMBER
    const roleB = Role.fromString(b) ?? Role.MEMBER
    return Role.ALL.indexOf(roleA) - Role.ALL.indexOf(roleB)
  }
}

// profile → profileSchema にリネームし export
export const profileSchema = z.object({
  id: z.string(),
  grade: z.preprocess((val) => Number(val), z.number()), // 文字列から数値へ変換
  role: Role.type(),
  getGradeAt: z.string().nullable(), // null を許可
  joinedAt: z.preprocess((val) => Number(val), z.number()), // 文字列から数値へ変換
  year: z.string(),
})

export const publicMetadataProfileSchema = z.object({
  role: Role.type().optional(),
  grade: z.preprocess((val) => Number(val), z.number()),
  getGradeAt: z.string().datetime().nullable(), // null を許可
  joinedAt: z.preprocess((val) => Number(val), z.number()),
  year: z.string(),
})
// createProfileInputSchema: createProfile用の入力スキーマ
export const createProfileInputSchema = z.object({
  id: z.string(),
  role: Role.type().optional(),
  year: z.string(),
  grade: z.preprocess((val) => Number(val), z.number()),
  joinedAt: z.preprocess((val) => Number(val), z.number()),
  getGradeAt: z.preprocess(
    (val) => (val instanceof Date ? val.toISOString() : val),
    z.string().datetime().nullable(),
  ),
})

// updateProfileInputSchema: updateProfile用の入力スキーマ
export const updateProfileInputSchema = z.object({
  id: z.string(),
  role: Role.type().optional(),
  year: z.string().optional(),
  grade: z.preprocess((val) => Number(val), z.number()).optional(),
  joinedAt: z.preprocess((val) => Number(val), z.number()).optional(),
  getGradeAt: z
    .preprocess(
      (val) => (val instanceof Date ? val.toISOString() : val),
      z.string().datetime().nullable(),
    )
    .optional(),
})
export const apiProfileInputSchema = z.object({
  id: z.string(),
  grade: z.preprocess((val) => Number(val), z.number()),
  role: Role.type().optional(),
  getGradeAt: z.string().datetime().nullable(),
  joinedAt: z.preprocess((val) => Number(val), z.number()),
  year: z.string(),
})
