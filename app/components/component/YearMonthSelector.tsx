import { useEffect, useState } from "react"

import { style } from "~/styles/component" // Import style

interface YearMonthSelectorModalProps {
  currentMonth: Date
  onSelect: (date: Date) => void
  isChanged: boolean
}

export default function YearMonthSelectorInline({
  currentMonth,
  onSelect,
  isChanged,
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
        className={style.form.input() + " w-20 text-center"}
        disabled={isChanged}
      />
      <span className="mx-1">年</span>
      <select
        value={month}
        id={`select-${month}`}
        onChange={e => setMonth(Number(e.target.value))}
        className={style.form.input()}
        disabled={isChanged}
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
