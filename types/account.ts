import { type } from "arktype"

import { Role } from "./role"

export const coerceProfileMetadata = (input: unknown): unknown => {
  if (!input || typeof input !== "object") return input
  const record = input as Record<string, unknown>

  const getGradeAt = record.getGradeAt
  if (getGradeAt === "") {
    return { ...record, getGradeAt: null }
  }
  if (typeof getGradeAt === "string") {
    const trimmed = getGradeAt.trim()
    if (!trimmed) {
      return { ...record, getGradeAt: null }
    }
    if (/^\d{4}-\d{2}-\d{2}T/.test(trimmed)) {
      return { ...record, getGradeAt: trimmed.slice(0, 10) }
    }
    if (trimmed !== getGradeAt) {
      return { ...record, getGradeAt: trimmed }
    }
  }

  return input
}

const profileFieldDefinition = {
  grade:
    "(string.numeric.parse |> -5 <= number.integer <= 5) | -5 <= number.integer <= 5",
  getGradeAt: "string & /^\\d{4}-\\d{2}-\\d{2}$/ | null | ''",
  joinedAt:
    "(string.numeric.parse |> 2020 <= number.integer <= 9999) | 2020 <= number.integer <= 9999",
  year: "string & /^(b[1-4]|m[1-2]|d[1-2])$/",
} as const

const getGradeAtRequestDefinition = profileFieldDefinition.getGradeAt

// DBに登録されている型（role 必須）
export const profileBaseSchema = type({ ...profileFieldDefinition, role: Role.type() })

// APIレスポンス等で id を含めたい場合
export const profileWithIdSchema = type({
  id: "string",
  ...profileFieldDefinition,
  role: Role.type(),
})

// Clerk publicMetadata は過去データ互換のため role を任意として受ける
export const publicMetadataProfileSchema = type({
  ...profileFieldDefinition,
  role: `${Role.type()}?`,
})

// User が送る入力（role は変更不可なので受け取らない）
export const userProfileInputSchema = type(profileFieldDefinition)
export type UserProfileInput = typeof userProfileInputSchema.infer

// User が送る入力（空文字の getGradeAt を許容する）
export const userProfileRequestSchema = type({
  ...profileFieldDefinition,
  getGradeAt: getGradeAtRequestDefinition,
})

// Admin が任意ユーザーの profile を更新する入力（部分更新）
export const adminUpdateProfileInputSchema = type({
  id: "string",
  role: `${Role.type()}?`,
  year: `${profileFieldDefinition.year}?`,
  grade: `${profileFieldDefinition.grade}?`,
  joinedAt: `${profileFieldDefinition.joinedAt}?`,
  getGradeAt: `(${getGradeAtRequestDefinition})?`,
})

export type AdminUpdateProfileInput = typeof adminUpdateProfileInputSchema.infer
