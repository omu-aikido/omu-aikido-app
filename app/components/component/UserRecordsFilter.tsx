import { useState } from "react"
import { useNavigate } from "react-router"
import { tv } from "tailwind-variants"

import { style } from "~/styles/component"

interface FilterSectionProps {
  startValue: string
  endValue: string
}

export function FilterSection({ startValue, endValue }: FilterSectionProps) {
  const [start, setStart] = useState(startValue)
  const [end, setEnd] = useState(endValue)
  const navigate = useNavigate()

  // クエリを変更してページ遷移
  const handleFilter = () => {
    const params = new URLSearchParams()
    if (start) params.set("start", start)
    if (end) params.set("end", end)
    navigate("?" + params.toString())
  }
  // リセットはクエリを消して遷移
  const handleReset = () => {
    navigate("?")
  }

  return (
    <details className={style.filterCard({ className: "mb-6" })}>
      <summary className="flex bg-slate-300 dark:bg-slate-600 p-4 cursor-pointer">
        フィルター
      </summary>
      <div className="p-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="start" className={style.text.info()}>
                開始日
              </label>
              <input
                type="date"
                id="start"
                name="start"
                value={start}
                onChange={e => setStart(e.target.value)}
                className={input()}
              />
            </div>
            <div>
              <label htmlFor="end" className={style.text.info()}>
                終了日
              </label>
              <input
                type="date"
                id="end"
                name="end"
                value={end}
                onChange={e => setEnd(e.target.value)}
                className={input()}
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
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

const input = tv({
  base: "w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent",
})
