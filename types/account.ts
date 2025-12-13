import { type } from "arktype"

export const profileSchema = type({
  role: "'admin'|'captain'|'vice-captain'|'treasurer'|'member'",
  grade:
    "(string.numeric.parse |> -5 <= number.integer <= 5) | -5 <= number.integer <= 5",
  getGradeAt: "string & /^\\d{4}-\\d{2}-\\d{2}$/ | null",
  joinedAt:
    "(string.numeric.parse |> 2020 <= number.integer <= 9999) | 2020 <= number.integer <= 9999",
  year: "string & /^(b[1-4]|m[1-2]|d[1-2])$/",
})
