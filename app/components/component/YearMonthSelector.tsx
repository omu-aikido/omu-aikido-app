import { useEffect, useState } from "react"

import { Input } from "~/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"

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
    <div className="flex items-center gap-2" data-testid="year-month-selector-container">
      <Input
        type="number"
        min={yearOptions[0]}
        max={yearOptions[yearOptions.length - 1]}
        value={year}
        onChange={e => setYear(Number(e.target.value))}
        className="w-20 text-center"
        disabled={isChanged}
        data-testid="year-month-selector-year"
      />
      <span className="mx-1">年</span>
      <Select
        value={month.toString()}
        onValueChange={value => setMonth(Number(value))}
        disabled={isChanged}
      >
        <SelectTrigger className="w-20" data-testid="year-month-selector-month">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {monthOptions.map(m => (
            <SelectItem key={m} value={m.toString()}>
              {m}月
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
