import { useState } from "react"
import { useNavigate } from "react-router"

import { DatePicker } from "~/components/ui/date-picker"
import { style } from "~/styles/component"

interface FilterSectionProps {
  startValue: string
  endValue: string
}

export function FilterSection({ startValue, endValue }: FilterSectionProps) {
  const [startDate, setStartDate] = useState<Date | undefined>(
    startValue ? new Date(startValue) : undefined,
  )
  const [endDate, setEndDate] = useState<Date | undefined>(
    endValue ? new Date(endValue) : undefined,
  )
  const navigate = useNavigate()

  // クエリを変更してページ遷移
  const handleFilter = () => {
    const params = new URLSearchParams()
    if (startDate) params.set("start", startDate.toISOString().split("T")[0])
    if (endDate) params.set("end", endDate.toISOString().split("T")[0])
    navigate("?" + params.toString())
  }

  // リセットはクエリを消して遷移
  const handleReset = () => {
    setStartDate(undefined)
    setEndDate(undefined)
    navigate("?")
  }

  return (
    <details className={style.filterCard({ className: "mb-6" })}>
      <summary className="flex cursor-pointer bg-slate-300 p-4 dark:bg-slate-600">
        フィルター
      </summary>
      <div className="p-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className={style.text.info()}>開始日</label>
              <DatePicker
                date={startDate}
                onSelect={setStartDate}
                placeholder="開始日を選択"
              />
            </div>
            <div>
              <label className={style.text.info()}>終了日</label>
              <DatePicker
                date={endDate}
                onSelect={setEndDate}
                placeholder="終了日を選択"
              />
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              className={style.button({ type: "secondary" })}
              onClick={handleReset}
            >
              リセット
            </button>
            <button type="button" className={style.button()} onClick={handleFilter}>
              フィルター
            </button>
          </div>
        </div>
      </div>
    </details>
  )
}
