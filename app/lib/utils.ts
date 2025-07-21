export const grade = [
  {
    name: "無級",
    grade: 0,
  },
  {
    name: "五級",
    grade: 5,
  },
  {
    name: "四級",
    grade: 4,
  },
  {
    name: "三級",
    grade: 3,
  },
  {
    name: "二級",
    grade: 2,
  },
  {
    name: "一級",
    grade: 1,
  },
  {
    name: "初段",
    grade: -1,
  },
  {
    name: "二段",
    grade: -2,
  },
  {
    name: "三段",
    grade: -3,
  },
  {
    name: "四段",
    grade: -4,
  },
]

export function translateGrade(grade_value: string | number): string {
  const grade_value_number = parseInt(String(grade_value))
  const grade_data = grade.find(g => g.grade === grade_value_number)
  return grade_data ? grade_data.name : "不明"
}

export function timeForNextGrade(grade_value: string | number): number {
  grade_value = parseInt(String(grade_value))
  switch (grade_value) {
    case 0:
      return 30
    case 5:
      return 60
    case 3:
      return 100
    case 1:
      return 100
    case -1:
      return 200
    default:
      return 30
  }
}

export const year = [
  {
    name: "1回生",
    year: "b1",
  },
  {
    name: "2回生",
    year: "b2",
  },
  {
    name: "3回生",
    year: "b3",
  },
  {
    name: "4回生",
    year: "b4",
  },
  {
    name: "修士1年",
    year: "m1",
  },
  {
    name: "修士2年",
    year: "m2",
  },
  {
    name: "博士1年",
    year: "d1",
  },
  {
    name: "博士2年",
    year: "d2",
  },
]

export function translateYear(year_value: string): string {
  const year_data = year.find(y => y.year === year_value)
  return year_data ? year_data.name : "不明"
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
