import React from "react"

import { style } from "@/app/styles/component"
import type { DailyActivityItem } from "@/app/type"

interface DayActivitySummaryProps {
  totalHours: number
  count: number
  status: DailyActivityItem["status"]
}

const DayActivitySummary = React.memo<DayActivitySummaryProps>(
  function DayActivitySummary({ totalHours, count, status }) {
    if (totalHours <= 0 && status !== "deleted")
      return <div className="text-transparent select-none">記録なし</div>

    if (totalHours <= 0)
      return (
        <div
          className={style.text.info({
            class: style.record.dayActivitySummaryStyles({ status }),
          })}
        >
          記録なし
        </div>
      )

    return (
      <div
        className={style.text.info({
          class: style.record.dayActivitySummaryStyles({ status }),
        })}
        data-testid="day-has-record"
        data-status={status}
      >
        <div className="flex items-center">合計 {Number(totalHours)}h</div>
        {count >= 2 && count < 100 && (
          <span className="flex h-4 w-4 place-items-center items-center justify-center rounded-full text-xs font-bold shadow-sm">
            {Number(count)}
          </span>
        )}
        {count >= 100 && (
          <span className="flex h-4 w-4 place-items-center items-center justify-center rounded-full text-xs font-bold shadow-sm">
            +99
          </span>
        )}
      </div>
    )
  },
)

export default DayActivitySummary
