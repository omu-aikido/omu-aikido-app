export const grade = [
  { name: '無級', grade: 0 },
  { name: '五級', grade: 5 },
  { name: '四級', grade: 4 },
  { name: '三級', grade: 3 },
  { name: '二級', grade: 2 },
  { name: '一級', grade: 1 },
  { name: '初段', grade: -1 },
  { name: '二段', grade: -2 },
  { name: '三段', grade: -3 },
  { name: '四段', grade: -4 },
  { name: '五段', grade: -5 },
];

export function translateGrade(grade_value: string | number): string {
  const raw = String(grade_value ?? '').trim();
  if (!raw) return '不明';
  const labelMatch = grade.find((g) => g.name === raw);
  if (labelMatch) return labelMatch.name;

  const grade_value_number = parseInt(raw, 10);
  const grade_data = grade.find((g) => g.grade === grade_value_number);
  return grade_data ? grade_data.name : '不明';
}

export function timeForNextGrade(grade_value: string | number): number {
  const grade_value_number = parseInt(String(grade_value), 10);
  switch (grade_value_number) {
    case 0:
      return 40;
    case 5:
    case 4:
      return 60;
    case 3:
    case 2:
      return 80;
    case 1:
      return 100;
    case -1:
      return 200;
    default:
      return 300;
  }
}
