import { useEffect, useState } from "react"

import type { ActivityType } from "~/db/schema"
import { style } from "~/styles/component" // Import style

export function Recents({ recent }: { recent: ActivityType | undefined }) {
  const relativeTime = (createAt: string) => {
    const now = Date.now()
    const diff = now - new Date(createAt).getTime()
    const secondsUnit = 1000
    const minutesUnit = 60 * secondsUnit
    const hoursUnit = 60 * minutesUnit
    const daysUnit = 24 * hoursUnit
    const weeksUnit = 7 * daysUnit
    const monthsUnit = 4 * weeksUnit
    const yearsUnit = 12 * monthsUnit
    let text = ""
    if (diff < 60 * secondsUnit) {
      text = "たった 今"
    } else if (diff < 60 * minutesUnit) {
      text = Math.floor(diff / minutesUnit) + "分前"
    } else if (diff < 24 * hoursUnit) {
      text = Math.floor(diff / hoursUnit) + "時間前"
    } else if (diff < 7 * daysUnit) {
      text = Math.floor(diff / daysUnit) + "日前"
    } else if (diff < 4 * weeksUnit) {
      text = Math.floor(diff / weeksUnit) + "週間前"
    } else if (diff < 12 * monthsUnit) {
      text = Math.floor(diff / monthsUnit) + "ヶ月前"
    } else {
      text = Math.floor(diff / yearsUnit) + "年前"
    }
    return text
  }

  const [date, setDate] = useState<string>("")
  const [createAt, setCreateAt] = useState<string>("")

  useEffect(() => {
    if (recent) {
      setDate(new Date(recent.date).toLocaleDateString())
      setCreateAt(new Date(recent.createAt).toLocaleString())
    }
  }, [recent])

  if (!recent) return null

  return (
    <div className={`${style.card.container()} mt-4`} data-testid="recents-container">
      <h2
        className="text-lg text-slate-600 dark:text-slate-300 mb-2 mt-0"
        data-testid="recents-title"
      >
        最近追加した項目:
        <small
          id="relative-time"
          data-timestamp={Number(new Date(recent.createAt).getTime())}
          className="text-sm"
          data-testid="recents-relative-time"
        >
          {relativeTime(String(recent.createAt))}
        </small>
      </h2>
      <div
        className="flex justify-between text-sm text-slate-600 dark:text-slate-300 md:flex-row flex-col"
        data-testid="recents-details"
      >
        <span className="mr-2" data-testid="recents-date">
          日付: {date}
        </span>
        <span className="mr-2" data-testid="recents-created">
          追加日時: {createAt}
        </span>
        <span data-testid="recents-period">{Number(recent.period)}時間</span>
      </div>
    </div>
  )
}

export default Recents
