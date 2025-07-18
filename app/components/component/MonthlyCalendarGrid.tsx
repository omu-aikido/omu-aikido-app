import { format, isSameDay } from "date-fns"

import type { DailyActivityItem } from "~/type"

type Props = {
  daysInMonth: Date[]
  currentActivities: DailyActivityItem[]
  onDayClick: (date: Date) => void
}

export default function MonthlyCalendarGrid({ daysInMonth, currentActivities, onDayClick }: Props) {
  return (
    <div className="min-w-[700px] grid grid-cols-7 gap-0 mb-6">
      {["日", "月", "火", "水", "木", "金", "土"].map((day, index) => (
        <div
          key={day}
          className={`font-bold text-center py-2 sm:py-4 border-y border-slate-200 dark:border-slate-600 ${
            index === 0
              ? "text-red-600 dark:text-red-400 border-l border-slate-200 dark:border-slate-600"
              : index === 6
                ? "text-blue-600 dark:text-blue-400 border-x border-r border-slate-200 dark:border-slate-600"
                : "text-slate-700 dark:text-slate-300 border-l border-slate-200 dark:border-slate-600"
          }`}
        >
          {day}
        </div>
      ))}
      {/* 月初の曜日分だけ空白セルを追加 */}
      {Array(daysInMonth[0].getDay())
        .fill(0)
        .map((_, i) => (
          <div
            key={`empty-start-${i}`}
            className="border-l border-b border-slate-200 dark:border-slate-600 bg-slate-100 dark:bg-slate-900 opacity-60 cursor-not-allowed min-h-[60px] sm:min-h-[100px]"
            aria-disabled="true"
          />
        ))}
      {daysInMonth.map((day, index) => {
        const isToday = isSameDay(day, new Date())
        const isSaturday = day.getDay() === 6
        const isSunday = day.getDay() === 0
        return (
          <div
            key={index}
            className={`p-1 sm:p-3 border-l border-b border-slate-200 dark:border-slate-600 cursor-pointer min-h-[60px] sm:min-h-[100px] transition-colors duration-200 ${
              isToday
                ? "bg-blue-100 dark:bg-blue-900/40 border-blue-300 dark:border-blue-600"
                : "bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800"
            }${isSaturday ? " border-r border-slate-200 dark:border-slate-600" : ""}`}
            onClick={() => onDayClick(day)}
          >
            <div
              className={`font-semibold mb-1 sm:mb-2 ${
                isSunday
                  ? "text-red-600 dark:text-red-400"
                  : isSaturday && !isToday
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-slate-900 dark:text-slate-100"
              }`}
            >
              {format(day, "d")}
            </div>
            <div className="space-y-1">
              {currentActivities
                .filter(act => act.date === format(day, "yyyy-MM-dd") && !act.isDeleted)
                .map((act, i) => (
                  <div
                    key={act.id || `tmp-${i}`}
                    className="text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-1 rounded-full font-medium"
                  >
                    {act.period}h
                  </div>
                ))}
            </div>
          </div>
        )
      })}
      {/* 月末の空白セルを追加 */}
      {Array(6 - daysInMonth[daysInMonth.length - 1].getDay())
        .fill(0)
        .map((_, i) => (
          <div
            key={`empty-end-${i}`}
            className="border-l border-b border-slate-200 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 opacity-60 cursor-not-allowed min-h-[60px] sm:min-h-[100px]"
            aria-disabled="true"
          />
        ))}
    </div>
  )
}
