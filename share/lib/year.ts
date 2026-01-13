export const year = [
  { name: '1回生', year: 'b1' },
  { name: '2回生', year: 'b2' },
  { name: '3回生', year: 'b3' },
  { name: '4回生', year: 'b4' },
  { name: '修士1年', year: 'm1' },
  { name: '修士2年', year: 'm2' },
  { name: '博士1年', year: 'd1' },
  { name: '博士2年', year: 'd2' },
];

export function translateYear(year_value: string): string {
  const raw = String(year_value ?? '').trim();
  if (!raw) return '不明';

  const code = raw.toLowerCase();
  const yearByCode = year.find((y) => y.year === code);
  if (yearByCode) return yearByCode.name;

  const yearByLabel = year.find((y) => y.name === raw);
  if (yearByLabel) return yearByLabel.name;

  const uiLabelMap: Record<string, string> = {
    '学部 1年': 'b1',
    '学部 2年': 'b2',
    '学部 3年': 'b3',
    '学部 4年': 'b4',
    '修士 1年': 'm1',
    '修士 2年': 'm2',
    '博士 1年': 'd1',
    '博士 2年': 'd2',
  };
  const mappedCode = uiLabelMap[raw];
  const yearByMapped = mappedCode ? year.find((y) => y.year === mappedCode) : undefined;
  return yearByMapped ? yearByMapped.name : '不明';
}
