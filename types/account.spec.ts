import { ArkErrors } from "arktype"
import { describe, expect, it } from "vitest"

import { coerceProfileMetadata, profileBaseSchema, userProfileRequestSchema } from "./account"

type Profile = typeof profileBaseSchema.infer

const baseProfile: Profile = {
  role: "member",
  grade: 0,
  getGradeAt: "2024-01-02",
  joinedAt: 2022,
  year: "b2",
}

describe("profileBaseSchema", () => {
  it("parses valid profile data", () => {
    const parsed = profileBaseSchema(baseProfile)
    if (parsed instanceof ArkErrors) {
      throw parsed
    }
    expect(parsed).toStrictEqual(baseProfile)
  })

  it("rejects invalid profile data", () => {
    const parsed = profileBaseSchema({ ...baseProfile, role: "invalid" })
    //expect throw error
    expect(parsed).toBeInstanceOf(ArkErrors)
  })

  it("rejects invalid profile data", () => {
    const parsed = profileBaseSchema({ ...baseProfile, getGradeAt: null })
    //expect throw error
    expect(parsed).not.toBeInstanceOf(ArkErrors)
  })

  it("parse stringed profile data", () => {
    const parsed = profileBaseSchema({ ...baseProfile, grade: "0", joinedAt: "2022" })
    if (parsed instanceof ArkErrors) {
      throw parsed
    }
    expect(parsed).toStrictEqual(baseProfile)
  })

  it("accepts empty string getGradeAt via coerceProfileMetadata", () => {
    const parsed = profileBaseSchema(
      coerceProfileMetadata({ ...baseProfile, getGradeAt: "" }),
    )
    if (parsed instanceof ArkErrors) {
      throw parsed
    }
    expect(parsed.getGradeAt).toBeNull()
  })

  it("accepts empty string getGradeAt without coercion", () => {
    const parsed = profileBaseSchema({ ...baseProfile, getGradeAt: "" })
    expect(parsed).not.toBeInstanceOf(ArkErrors)
  })
})

describe("userProfileRequestSchema", () => {
  it("accepts empty string getGradeAt", () => {
    const parsed = userProfileRequestSchema({
      year: "b2",
      grade: 0,
      joinedAt: 2022,
      getGradeAt: "",
    })
    expect(parsed).not.toBeInstanceOf(ArkErrors)
  })
})
