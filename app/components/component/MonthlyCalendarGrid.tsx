import { format, isSameDay } from "date-fns"
import React from "react"
import { tv } from "tailwind-variants"

import { style } from "../../styles/component"

import type { DailyActivityItem } from "~/type"

type Props = {
  daysInMonth: Date[]
  currentActivities: DailyActivityItem[]
  onDayClick: (date: Date) => void
}

const cell = tv({
  slots: {
    week: "font-bold text-center py-2 border-y border-slate-200 dark:border-slate-600 first:border-l border-r",
    date: [
      "min-h-[60px] sm:min-h-[100px] border-r border-b border-slate-200 dark:border-slate-600",
    ],
  },
  compoundSlots: [
    {
      slots: ["week", "date"],
      class: [
        "p-2 transition-colors duration-200",
        "border-slate-300 dark:border-slate-600",
      ],
    },
  ],
  variants: {
    isSaturday: {
      true: {
        week: "text-blue-400 dark:text-blue-600",
        date: "text-blue-400 dark:text-blue-600",
      },
    },
    isSunday: {
      true: {
        week: "text-red-400 dark:text-red-600",
        date: "text-red-400 dark:text-red-600",
      },
    },
    isToday: {
      true: {
        week: "border-blue-300 dark:border-blue-600",
        date: "border-blue-300 dark:border-blue-600",
      },
    },
    disabled: {
      true: { date: "bg-slate-100 dark:bg-slate-800 opacity-80" },
      false: {
        date: "cursor-pointer bg-white dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800",
      },
    },
    isFirstRow: { true: { date: "border-t" } },
    isFirstCol: { true: { date: "border-l" } },
  },
  defaultVariants: { disabled: false },
})

// 日ごとのセルコンポーネント
const CalendarDayCell = React.memo<{
  day: Date
  currentActivities: DailyActivityItem[]
  onDayClick: (date: Date) => void
  rowIndex: number
  colIndex: number
}>(function CalendarDayCell({ day, currentActivities, onDayClick, rowIndex, colIndex }) {
  const isToday = React.useMemo(() => isSameDay(day, new Date()), [day])
  const isSaturday = React.useMemo(() => day.getDay() === 6, [day])
  const isSunday = React.useMemo(() => day.getDay() === 0, [day])

  const { totalHours, count } = React.useMemo(() => {
    const activities = currentActivities.filter(
      act => act.date === format(day, "yyyy-MM-dd") && !act.isDeleted,
    )
    const hours = activities.reduce(
      (sum, act) => sum + (typeof act.period === "number" ? act.period : 0),
      0,
    )
    return { totalHours: hours, count: activities.length }
  }, [currentActivities, day])

  const handleClick = React.useCallback(() => {
    onDayClick(day)
  }, [onDayClick, day])

  return (
    <div
      className={cell({
        isSaturday,
        isSunday,
        isToday,
        isFirstRow: rowIndex === 0,
        isFirstCol: colIndex === 0,
      }).date()}
      onClick={handleClick}
    >
      <div className="font-semibold mb-1 sm:mb-2">{format(day, "d")}</div>
      <div className="space-y-1">
        <DayActivitySummary totalHours={totalHours} count={count} />
      </div>
    </div>
  )
})

// 曜日ヘッダーセルコンポーネント（Tailwind Variants対応）
const allowedWeekdays = ["日", "月", "火", "水", "木", "金", "土"] as const
type AllowedWeekday = (typeof allowedWeekdays)[number]

const WeekdayHeaderCell = React.memo<{ day: AllowedWeekday; index: number }>(
  function WeekdayHeaderCell({ day, index }) {
    const isSunday = React.useMemo(() => index === 0, [index])
    const isSaturday = React.useMemo(() => index === 6, [index])
    const safeDay = allowedWeekdays.includes(day) ? day : ""
    return <div className={cell({ isSunday, isSaturday }).week()}>{safeDay}</div>
  },
)

const DayActivitySummary = React.memo<{ totalHours: number; count: number }>(
  function DayActivitySummary({ totalHours, count }) {
    if (totalHours <= 0) return null
    return (
      <div
        className={style.text.info({
          class:
            "flex justify-between md:text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-1 rounded-sm font-medium",
        })}
      >
        合計 {Number(totalHours)}h
        {count >= 2 && count < 100 && (
          <span className="place-items-center flex items-center bg-green-700 dark:bg-green-200 text-green-100 dark:text-green-800 rounded-full w-4 h-4 justify-center text-xs font-bold shadow-sm">
            {Number(count)}
          </span>
        )}
        {count >= 100 && (
          <span className="place-items-center flex items-center bg-green-700 dark:bg-green-200 text-green-100 dark:text-green-800 rounded-full w-4 h-4 justify-center text-xs font-bold shadow-sm">
            +99
          </span>
        )}
      </div>
    )
  },
)

const MonthlyCalendarGrid = React.memo<Props>(function MonthlyCalendarGrid({
  daysInMonth,
  currentActivities,
  onDayClick,
}) {
  const firstDayCol = React.useMemo(() => daysInMonth[0]?.getDay() ?? 0, [daysInMonth])

  const weekdays = React.useMemo(
    () => ["日", "月", "火", "水", "木", "金", "土"] as const,
    [],
  )

  const emptyStartCells = React.useMemo(() => Array(firstDayCol).fill(0), [firstDayCol])

  const emptyEndCells = React.useMemo(() => {
    const lastDay = daysInMonth[daysInMonth.length - 1]
    return lastDay ? Array(6 - lastDay.getDay()).fill(0) : []
  }, [daysInMonth])

  return (
    <div className="min-w-[700px] grid grid-cols-7 gap-0 mb-6">
      {weekdays.map((day, index) => (
        <WeekdayHeaderCell key={day} day={day} index={index} />
      ))}
      {/* 月初の曜日分だけ空白セルを追加 */}
      {emptyStartCells.map((_, i) => (
        <div
          key={`empty-start-${i}`}
          className={cell({
            disabled: true,
            isFirstRow: true,
            isFirstCol: i === 0,
          }).date()}
          aria-disabled="true"
        />
      ))}
      {daysInMonth.map((day, idx) => {
        const colIndex = (firstDayCol + idx) % 7
        const rowIndex = Math.floor((firstDayCol + idx) / 7)
        return (
          <CalendarDayCell
            key={idx}
            day={day}
            currentActivities={currentActivities}
            onDayClick={onDayClick}
            rowIndex={rowIndex}
            colIndex={colIndex}
          />
        )
      })}
      {/* 月末の空白セルを追加 */}
      {emptyEndCells.map((_, i) => (
        <div
          key={`empty-end-${i}`}
          className={cell({
            disabled: true,
            isFirstCol: (daysInMonth[daysInMonth.length - 1].getDay() + 1 + i) % 7 === 0,
          }).date()}
          aria-disabled="true"
        />
      ))}
    </div>
  )
})

export default MonthlyCalendarGrid
