import { format, isSameDay } from "date-fns"
import React from "react"
import { tv } from "tailwind-variants"

import DayActivitySummary from "@/app/components/component/DayActivitySummary" // 新しいインポートパス
import type { DailyActivityItem } from "@/app/type"

interface Props {
  daysInMonth: Date[]
  currentActivities: DailyActivityItem[]
  onDayClick: (date: Date) => void
}

const cell = tv({
  slots: {
    week: "border-y border-r border-slate-200 py-2 text-center font-bold first:border-l dark:border-slate-600",
    date: [
      "min-h-[60px] border-r border-b border-slate-200 sm:min-h-[100px] dark:border-slate-600",
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
      true: { date: "bg-slate-100 opacity-80 dark:bg-slate-800" },
      false: {
        date: "cursor-pointer bg-white hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800",
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

  const { totalHours, count, status } = React.useMemo(() => {
    const dayActivities = currentActivities.filter(
      act => act.date === format(day, "yyyy-MM-dd"),
    )

    // 活動の振る舞いを判定するフラグ
    const hasDeleted = dayActivities.some(
      act => act.status === "deleted" || act.isDeleted,
    )
    const hasAdded = dayActivities.some(act => act.status === "added")
    const hasUpdated = dayActivities.some(act => act.status === "updated")
    // 追加と削除の合計を算出し、相殺判定を行う
    const addedSum = dayActivities
      .filter(act => act.status === "added" && !act.isDeleted)
      .reduce(
        (sum, act) =>
          sum +
          (typeof act.period === "number" ? act.period : parseFloat(String(act.period))),
        0,
      )
    const deletedSum = dayActivities
      .filter(act => act.status === "deleted" || act.isDeleted)
      .reduce(
        (sum, act) =>
          sum +
          (typeof act.period === "number" ? act.period : parseFloat(String(act.period))),
        0,
      )

    // 削除扱いのものを除いた合計時間・件数
    const activeActivities = dayActivities.filter(
      act => !(act.isDeleted || act.status === "deleted"),
    )
    const totalHoursForDay = activeActivities.reduce(
      (sum, act) =>
        sum +
        (typeof act.period === "number" ? act.period : parseFloat(String(act.period))),
      0,
    )
    const countForDay = activeActivities.length

    let activityStatus: DailyActivityItem["status"] = "unchanged"

    if (totalHoursForDay <= 0) {
      // 合計が0の場合、追加と削除が相殺しているときは unchanged にする
      if (hasAdded && hasDeleted && !hasUpdated && addedSum === deletedSum) {
        activityStatus = "unchanged"
      } else {
        activityStatus = hasDeleted ? "deleted" : "unchanged"
      }
    } else {
      // 合計がある場合の優先順位:
      // - 純粋に新規追加のみ → 'added'
      // - 既存と混在（新規+既存）や update/deleted がある場合 → 'updated'
      // - それ以外 → 'unchanged'
      // 新規追加が含まれていて、既存のアイテムが編集されておらず削除もない場合は added とする。
      // 既存アイテムの更新や削除がある場合は updated を優先する。
      if (hasAdded && !hasUpdated && !hasDeleted) {
        activityStatus = "added"
      } else if (hasUpdated || hasDeleted) {
        activityStatus = "updated"
      } else {
        activityStatus = "unchanged"
      }
    }

    return { totalHours: totalHoursForDay, count: countForDay, status: activityStatus }
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
      data-testid={`day-${format(day, "d")}`}
    >
      <div className="mb-1 font-semibold sm:mb-2">{format(day, "d")}</div>
      <div
        className="space-y-1"
        data-testid={
          count === 0
            ? `day-${format(day, "d")}-no-record`
            : `day-${format(day, "d")}-has-record`
        }
      >
        <DayActivitySummary totalHours={totalHours} count={count} status={status} />
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
    <div
      className="mb-6 grid min-w-175 grid-cols-7 gap-0"
      data-testid="monthly-activity-grid"
    >
      {weekdays.map((day, index) => (
        <WeekdayHeaderCell
          key={day}
          day={day}
          index={index}
          data-testid={`weekday-${day}`}
        />
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
          data-testid="empty-start-cell"
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
          data-testid="empty-end-cell"
        />
      ))}
    </div>
  )
})

export default MonthlyCalendarGrid
