import { useEffect, useState } from "react"

interface YearMonthSelectorModalProps {
  currentMonth: Date
  onSelect: (date: Date) => void
}

export default function YearMonthSelectorInline({
  currentMonth,
  onSelect,
}: YearMonthSelectorModalProps) {
  const [year, setYear] = useState(currentMonth.getFullYear())
  const [month, setMonth] = useState(currentMonth.getMonth() + 1)
  const now = new Date()
  const yearOptions = Array.from({ length: 4 }, (_, i) => now.getFullYear() - 2 + i)
  const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1)

  useEffect(() => {
    onSelect(new Date(year, month - 1, 1))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month])

  return (
    <div className="flex gap-2 items-center">
      <input
        type="number"
        id="select-year"
        min={yearOptions[0]}
        max={yearOptions[yearOptions.length - 1]}
        value={year}
        onChange={e => setYear(Number(e.target.value))}
        className="w-20 px-2 py-1 border rounded text-center bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white"
      />
      <span className="mx-1">年</span>
      <select
        value={month}
        id={`select-${month}`}
        onChange={e => setMonth(Number(e.target.value))}
        className="px-2 py-1 border rounded bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white"
      >
        {monthOptions.map(m => (
          <option key={m} value={m}>
            {m}月
          </option>
        ))}
      </select>
    </div>
  )
}
