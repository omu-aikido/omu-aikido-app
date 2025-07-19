import { format } from "date-fns"
import { tv } from "tailwind-variants"

import { style } from "~/styles/component"
import type { DailyActivityItem } from "~/type"

type Props = {
  daysInMonth: Date[]
  currentActivities: DailyActivityItem[]
  onDayClick: (date: Date) => void
}

const listItem = tv({
  base: "flex items-start py-3 px-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors",
  variants: {
    today: {
      true: "bg-green-100 dark:bg-green-900/40",
      false: "",
    },
  },
})

const dayLabel = tv({
  base: "w-20 flex-shrink-0 font-semibold",
  variants: {
    day: {
      sunday: "text-red-500 dark:text-red-400",
      saturday: "text-blue-500 dark:text-blue-400",
      weekday: "text-slate-700 dark:text-slate-300",
    },
  },
})

function DayActivitySummary({ totalHours, count }: { totalHours: number; count: number }) {
  if (totalHours <= 0) return null
  return (
    <div className="flex flex-row justify-between">
      <div
        className={style.text.info({
          class:
            "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-1 rounded-sm font-medium",
        })}
      >
        合計 {totalHours}h
      </div>
      {count >= 2 && count < 100 && (
        <span className="place-items-center flex items-center bg-green-700 dark:bg-green-200 text-green-100 dark:text-green-800 rounded-full w-6 h-6 justify-center text-xs font-bold shadow-sm">
          {count}
        </span>
      )}
      {count >= 100 && (
        <span className="place-items-center flex items-center bg-green-700 dark:bg-green-200 text-green-100 dark:text-green-800 rounded-full w-6 h-6 justify-center text-xs font-bold shadow-sm">
          +99
        </span>
      )}
    </div>
  )
}

export default function MonthlyActivityList({ daysInMonth, currentActivities, onDayClick }: Props) {
  return (
    <ul className="divide-y divide-slate-200 dark:divide-slate-700">
      {daysInMonth.map((day, idx) => {
        const acts = currentActivities.filter(
          act => act.date === format(day, "yyyy-MM-dd") && !act.isDeleted,
        )
        const isToday = format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
        const dayOfWeek =
          day.getDay() === 0 ? "sunday" : day.getDay() === 6 ? "saturday" : "weekday"
        const total = acts.reduce(
          (sum, act) =>
            sum + (typeof act.period === "number" ? act.period : parseFloat(act.period)),
          0,
        )
        return (
          <li key={idx} className={listItem({ today: isToday })} onClick={() => onDayClick(day)}>
            <div className={dayLabel({ day: dayOfWeek })}>
              {`${format(day, "d日")}
                (${["日", "月", "火", "水", "木", "金", "土"][day.getDay()]})`}
            </div>
            <div className="flex-1 space-y-1">
              {acts.length === 0 ? (
                <span className={style.text.info({ class: "text-sm text-slate-500" })}>
                  記録なし
                </span>
              ) : (
                <span className={style.text.info("text-sm")}>
                  <DayActivitySummary totalHours={total} count={acts.length} />
                </span>
              )}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
