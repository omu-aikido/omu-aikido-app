import { format } from "date-fns"

import type { DailyActivityItem } from "~/type"

type Props = {
  daysInMonth: Date[]
  currentActivities: DailyActivityItem[]
  onDayClick: (date: Date) => void
}

export default function MonthlyActivityList({ daysInMonth, currentActivities, onDayClick }: Props) {
  return (
    <ul className="divide-y divide-slate-200 dark:divide-slate-700">
      {daysInMonth.map((day, idx) => {
        const acts = currentActivities.filter(
          act => act.date === format(day, "yyyy-MM-dd") && !act.isDeleted,
        )
        return (
          <li
            key={idx}
            className={[
              "flex items-start py-3 px-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors",
              format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
                ? "bg-green-100 dark:bg-green-900/40"
                : "",
            ].join(" ")}
            onClick={() => onDayClick(day)}
          >
            <div
              className={[
                "w-20 flex-shrink-0 font-semibold",
                day.getDay() === 0
                  ? "text-red-500 dark:text-red-400"
                  : day.getDay() === 6
                    ? "text-blue-500 dark:text-blue-400"
                    : "text-slate-700 dark:text-slate-300",
              ].join(" ")}
            >
              {`${format(day, "d日")}
                (${["日", "月", "火", "水", "木", "金", "土"][day.getDay()]})`}
            </div>
            <div className="flex-1 space-y-1">
              {acts.length === 0 ? (
                <span className="text-slate-400 text-sm">記録なし</span>
              ) : (
                acts.map((act, i) => (
                  <span
                    key={act.id || `tmp-${i}`}
                    className="inline-block bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-1 rounded-full text-xs font-medium mr-2"
                  >
                    {act.period}h
                  </span>
                ))
              )}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
