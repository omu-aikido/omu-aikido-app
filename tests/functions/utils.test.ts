import { describe, expect, it } from "vitest"

import { timeForNextGrade, translateGrade, translateYear } from "../../app/lib/utils"

describe("translateGrade", () => {
  it("should return the correct grade name for a given grade value", () => {
    expect(translateGrade(0)).toBe("無級")
    expect(translateGrade(5)).toBe("五級")
    expect(translateGrade(4)).toBe("四級")
    expect(translateGrade(3)).toBe("三級")
    expect(translateGrade(2)).toBe("二級")
    expect(translateGrade(1)).toBe("一級")
    expect(translateGrade(-1)).toBe("初段")
    expect(translateGrade(-2)).toBe("二段")
    expect(translateGrade(-3)).toBe("三段")
    expect(translateGrade(-4)).toBe("四段")
  })

  it("should return '不明' for an unknown grade value", () => {
    expect(translateGrade(99)).toBe("不明")
    expect(translateGrade("unknown")).toBe("不明")
  })
})

describe("timeForNextGrade", () => {
  it("should return the correct time for the next grade based on current grade", () => {
    expect(timeForNextGrade(0)).toBe(30)
    expect(timeForNextGrade(5)).toBe(60)
    expect(timeForNextGrade(3)).toBe(100)
    expect(timeForNextGrade(1)).toBe(100)
    expect(timeForNextGrade(-1)).toBe(200)
  })

  it("should return 30 for unknown grade values", () => {
    expect(timeForNextGrade(99)).toBe(30)
    expect(timeForNextGrade("unknown")).toBe(30)
  })
})

describe("translateYear", () => {
  it("should return the correct year name for a given year value", () => {
    expect(translateYear("b1")).toBe("1回生")
    expect(translateYear("b2")).toBe("2回生")
    expect(translateYear("b3")).toBe("3回生")
    expect(translateYear("b4")).toBe("4回生")
    expect(translateYear("m1")).toBe("修士1年")
    expect(translateYear("m2")).toBe("修士2年")
    expect(translateYear("d1")).toBe("博士1年")
    expect(translateYear("d2")).toBe("博士2年")
  })

  it("should return '不明' for an unknown year value", () => {
    expect(translateYear("unknown")).toBe("不明")
  })
})
