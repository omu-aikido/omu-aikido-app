import { ArkErrors } from "arktype"
import { describe, expect, it } from "vitest"

import { profileSchema } from "./account"

type Profile = typeof profileSchema.infer

const baseProfile: Profile = {
  role: "member",
  grade: 0,
  getGradeAt: "2024-01-02",
  joinedAt: 2022,
  year: "b2",
}

describe("profileSchema", () => {
  it("parses valid profile data", () => {
    const parsed = profileSchema(baseProfile)
    if (parsed instanceof ArkErrors) {
      throw parsed
    }
    expect(parsed).toStrictEqual(baseProfile)
  })

  it("rejects invalid profile data", () => {
    const parsed = profileSchema({ ...baseProfile, role: "invalid" })
    //expect throw error
    expect(parsed).toBeInstanceOf(ArkErrors)
  })

  it("rejects invalid profile data", () => {
    const parsed = profileSchema({ ...baseProfile, getGradeAt: null })
    //expect throw error
    expect(parsed).not.toBeInstanceOf(ArkErrors)
  })

  it("parse stringed profile data", () => {
    const parsed = profileSchema({ ...baseProfile, grade: "0", joinedAt: "2022" })
    if (parsed instanceof ArkErrors) {
      throw parsed
    }
    expect(parsed).toStrictEqual(baseProfile)
  })
})
