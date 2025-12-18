import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export const grade = [
  { name: "無級", grade: 0 },
  { name: "五級", grade: 5 },
  { name: "四級", grade: 4 },
  { name: "三級", grade: 3 },
  { name: "二級", grade: 2 },
  { name: "一級", grade: 1 },
  { name: "初段", grade: -1 },
  { name: "二段", grade: -2 },
  { name: "三段", grade: -3 },
  { name: "四段", grade: -4 },
  { name: "五段", grade: -5 },
]

export function translateGrade(grade_value: string | number): string {
  const raw = String(grade_value ?? "").trim()
  if (!raw) return "不明"
  const labelMatch = grade.find(g => g.name === raw)
  if (labelMatch) return labelMatch.name

  const grade_value_number = parseInt(raw)
  const grade_data = grade.find(g => g.grade === grade_value_number)
  return grade_data ? grade_data.name : "不明"
}

export function timeForNextGrade(grade_value: string | number): number {
  const grade_value_number = parseInt(String(grade_value))
  switch (grade_value_number) {
    case 0:
      return 40
    case 5:
    case 4:
      return 60
    case 3:
    case 2:
      return 80
    case 1:
      return 100
    case -1:
      return 200
    default:
      return 300
  }
}

export const year = [
  { name: "1回生", year: "b1" },
  { name: "2回生", year: "b2" },
  { name: "3回生", year: "b3" },
  { name: "4回生", year: "b4" },
  { name: "修士1年", year: "m1" },
  { name: "修士2年", year: "m2" },
  { name: "博士1年", year: "d1" },
  { name: "博士2年", year: "d2" },
]

export function translateYear(year_value: string): string {
  const raw = String(year_value ?? "").trim()
  if (!raw) return "不明"

  const code = raw.toLowerCase()
  const yearByCode = year.find(y => y.year === code)
  if (yearByCode) return yearByCode.name

  const yearByLabel = year.find(y => y.name === raw)
  if (yearByLabel) return yearByLabel.name

  const uiLabelMap: Record<string, string> = {
    "学部 1年": "b1",
    "学部 2年": "b2",
    "学部 3年": "b3",
    "学部 4年": "b4",
    "修士 1年": "m1",
    "修士 2年": "m2",
    "博士 1年": "d1",
    "博士 2年": "d2",
  }
  const mappedCode = uiLabelMap[raw]
  const yearByMapped = mappedCode ? year.find(y => y.year === mappedCode) : undefined
  return yearByMapped ? yearByMapped.name : "不明"
}

export function toLocalJPString(date: Date): string {
  return date.toLocaleDateString("ja-JP", {
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "numeric",
  })
}

/**
 * エッジ環境とクライアント環境での時刻の補正
 * @param date UTCでの時刻を期待
 * @returns 9時間足したもの
 */
export function getJST(date: Date): Date {
  const jstDate = new Date(date.getTime() + 9 * 60 * 60 * 1000)
  return jstDate
}

/**
 * 日付をJST基準のYYYY-MM-DD形式の文字列に変換
 * クライアント側でもサーバー側でも一貫したJST日付を取得するために使用
 * @param date 変換対象のDateオブジェクト
 * @returns JST基準のYYYY-MM-DD形式の文字列
 */
export function formatDateToJSTString(date: Date): string {
  const jstDate = getJST(date)
  return jstDate.toISOString().split("T")[0]
}

export class JoinedAtYearRange {
  static RANGE = 4
  static get min() {
    return new Date().getFullYear() - this.RANGE
  }
  static get max() {
    return new Date().getFullYear()
  }
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
