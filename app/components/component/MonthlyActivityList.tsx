import { format } from "date-fns";
import React from "react";
import { tv } from "tailwind-variants";

import DayActivitySummary from "~/components/component/DayActivitySummary"; // 正しいインポートパス
import { style } from "~/styles/component";
import type { DailyActivityItem } from "~/type";

type Props = {
  daysInMonth: Date[]
  currentActivities: DailyActivityItem[]
  onDayClick: (date: Date) => void
}

const listItem = tv({
  base: "flex items-center flex-row justify-between py-3 px-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors",
  variants: { today: { true: "bg-green-100 dark:bg-green-900/40", false: "" } },
})

const dayLabel = tv({
  base: "w-20 shrink-0 font-semibold",
  variants: {
    day: {
      sunday: "text-red-500 dark:text-red-400",
      saturday: "text-blue-500 dark:text-blue-400",
      weekday: "text-slate-700 dark:text-slate-300",
    },
  },
})

const MonthlyActivityList = React.memo<Props>(function MonthlyActivityList({
  daysInMonth,
  currentActivities,
  onDayClick,
}) {
  return (
    <ul
      className="divide-y divide-slate-200 dark:divide-slate-700"
      data-testid="monthly-activity-list"
    >
      {daysInMonth.map((day, idx) => {
        const acts = currentActivities.filter(
          act =>
            act.date === format(day, "yyyy-MM-dd") &&
            !act.isDeleted &&
            act.status !== "deleted", // isDeleted と status: 'deleted' の活動を除外
        )
        const isToday = format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
        const dayOfWeek =
          day.getDay() === 0 ? "sunday" : day.getDay() === 6 ? "saturday" : "weekday"
        const total = acts.reduce(
          (sum, act) =>
            sum + (typeof act.period === "number" ? act.period : parseFloat(act.period)),
          0,
        )

        // Determine the overall status for the day based on its activities
        let dayStatus: DailyActivityItem["status"] = "unchanged"
        const dayActivities = currentActivities.filter(
          act => act.date === format(day, "yyyy-MM-dd"),
        )

        const hasDeleted = dayActivities.some(
          act => act.status === "deleted" || act.isDeleted,
        )
        const hasAdded = dayActivities.some(act => act.status === "added")
        const hasUpdated = dayActivities.some(act => act.status === "updated")

        // 追加された期間と削除された期間の合計を比較して相殺を判定
        const addedSum = dayActivities
          .filter(act => act.status === "added" && !act.isDeleted)
          .reduce(
            (sum, act) =>
              sum +
              (typeof act.period === "number"
                ? act.period
                : parseFloat(String(act.period))),
            0,
          )
        const deletedSum = dayActivities
          .filter(act => act.status === "deleted" || act.isDeleted)
          .reduce(
            (sum, act) =>
              sum +
              (typeof act.period === "number"
                ? act.period
                : parseFloat(String(act.period))),
            0,
          )

        const totalHoursForDay = dayActivities
          .filter(act => !(act.isDeleted || act.status === "deleted")) // 削除された活動は合計時間に含めない
          .reduce(
            (sum, act) =>
              sum +
              (typeof act.period === "number"
                ? act.period
                : parseFloat(String(act.period))),
            0,
          )

        if (totalHoursForDay > 0) {
          // 追加と削除が同時にあり、期間合計が相殺される場合は変更なしとする
          if (hasAdded && hasDeleted && !hasUpdated && addedSum === deletedSum) {
            dayStatus = "unchanged"
          } else if (hasAdded && !hasUpdated && !hasDeleted) {
            // 新規追加のみ
            dayStatus = "added"
          } else if (hasUpdated || hasDeleted) {
            // 更新または削除がある場合は更新扱い
            dayStatus = "updated"
          } else {
            dayStatus = "unchanged"
          }
        } else {
          // 表示上合計が0または無い場合
          // 追加と削除が相殺している場合は変更なしとする
          if (hasAdded && hasDeleted && !hasUpdated && addedSum === deletedSum) {
            dayStatus = "unchanged"
          } else if (hasDeleted) {
            // 削除のみ
            dayStatus = "deleted"
          } else {
            dayStatus = "unchanged"
          }
        }

        return (
          <li
            key={idx}
            data-testid={`day-${format(day, "d")}`}
            className={listItem({ today: isToday })}
            onClick={() => onDayClick(day)}
          >
            <div className={dayLabel({ day: dayOfWeek })}>
              {`${format(day, "d日")}
                (${["日", "月", "火", "水", "木", "金", "土"][day.getDay()]})`}
            </div>
            <div
              className="flex-1 space-y-1"
              data-testid={
                acts.length === 0
                  ? `day-${format(day, "d")}-no-record`
                  : `day-${format(day, "d")}-has-record`
              }
            >
              <span className={style.text.info("text-sm")} data-testid={`day-has-record`}>
                <DayActivitySummary
                  totalHours={total}
                  count={acts.length}
                  status={dayStatus}
                />
              </span>
            </div>
          </li>
        )
      })}
    </ul>
  )
})

export default MonthlyActivityList
