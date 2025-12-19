import { format } from "date-fns"
import React, { useState } from "react"

import { toLocalJPString } from "@/app/lib/utils"
import { style } from "@/app/styles/component"
import type { DailyActivityItem } from "@/app/type"

interface DailyActivityProps {
  userId: string
  date: Date | null
  activities: DailyActivityItem[]
  onSave: (updatedActivities: DailyActivityItem[]) => void
  onClose: () => void
}

const DailyActivity: React.FC<DailyActivityProps> = ({
  userId,
  date,
  activities,
  onSave,
  onClose,
}) => {
  const [dailyActivities, setDailyActivities] = useState<DailyActivityItem[]>(() =>
    activities.map(act => ({ ...act, originalPeriod: act.originalPeriod ?? act.period })),
  )

  const handlePeriodChange = (id: DailyActivityItem["id"], newPeriod: number) => {
    setDailyActivities(prev => {
      const updated = prev.map(act =>
        act.id === id
          ? {
              ...act,
              period: newPeriod,
              originalPeriod: act.originalPeriod ?? act.period,
              status: act.status === "added" ? "added" : "updated",
            }
          : act,
      ) as DailyActivityItem[]

      // もし編集したのが一時追加エントリで、値が既に存在する "削除済み" の persisted エントリと一致するなら、
      // - 一時エントリを完全に破棄
      // - 該当する persisted エントリの isDeleted を false に戻す（削除取り消し）
      const edited = updated.find(act => act.id === id)
      if (edited && String(edited.id).startsWith("tmp-") && !edited.isDeleted) {
        const matchIndex = updated.findIndex(
          act =>
            !String(act.id).startsWith("tmp-") && // persisted
            (act.isDeleted || act.status === "deleted") &&
            act.userId === edited.userId &&
            act.date === edited.date &&
            act.period === edited.period,
        )

        if (matchIndex !== -1) {
          // remove the temp entry and restore the persisted one
          const matchId = updated[matchIndex].id
          return updated
            .filter(act => act.id !== id)
            .map(act => {
              if (act.id === matchId) {
                return {
                  ...act,
                  isDeleted: false,
                  status: "unchanged",
                  updatedAt: new Date().toISOString(),
                }
              }
              return act
            }) as DailyActivityItem[]
        }
      }

      return updated as DailyActivityItem[]
    })
  }

  const handleDeleteActivity = (id: DailyActivityItem["id"]) => {
    setDailyActivities(prev => {
      // 未保存の一時エントリは id が `tmp-` で始まるため、削除時に完全に除去する
      if (String(id).startsWith("tmp-")) {
        return prev.filter(act => act.id !== id)
      }
      // 永続化済みエントリは削除フラグを付ける。ただし、編集によって period が変わっている場合は
      // originalPeriod があれば period を元に戻してから削除フラグを付与する。
      return prev.map(act => {
        if (act.id !== id) return act
        const restoredPeriod = act.originalPeriod ?? act.period
        return { ...act, period: restoredPeriod, isDeleted: true, status: "deleted" }
      })
    })
  }

  const handleAddActivity = () => {
    if (!date) return
    setDailyActivities(prev => {
      const newDate = format(date, "yyyy-MM-dd")
      const defaultPeriod = 1.5

      // もし既存の（永続化された）エントリが同じ日・同じ時間で削除済みなら、
      // その削除を取り消して編集可能状態に戻す（追加は行わない）。
      const idx = prev.findIndex(
        act =>
          !String(act.id).startsWith("tmp-") && // 永続化済み
          (act.isDeleted || act.status === "deleted") &&
          act.userId === userId &&
          act.date === newDate &&
          act.period === defaultPeriod,
      )

      if (idx !== -1) {
        return prev.map((act, i) => {
          if (i === idx) {
            return {
              ...act,
              isDeleted: false,
              status: "unchanged",
              updatedAt: new Date().toISOString(),
            }
          }
          return act
        })
      }

      // 該当する削除済み persisted がなければ通常どおり一時追加する
      return [
        ...prev,
        {
          id: `tmp-${crypto.randomUUID()}`,
          userId,
          date: newDate,
          period: defaultPeriod,
          createAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isDeleted: false,
          status: "added",
        } as DailyActivityItem,
      ]
    })
  }

  const handleSave = () => {
    onSave(dailyActivities)
  }

  // 表示用の活動を生成するロジック
  const displayItems: DailyActivityItem[] = []
  const groupedByPeriod = new Map<number, DailyActivityItem[]>()

  dailyActivities.forEach(act => {
    if (!groupedByPeriod.has(act.period)) {
      groupedByPeriod.set(act.period, [])
    }
    groupedByPeriod.get(act.period)?.push(act)
  })

  const periods = Array.from(groupedByPeriod.keys())

  periods.forEach(period => {
    const group = groupedByPeriod.get(period)!
    const allDeletedInGroup = group.every(
      act => act.isDeleted || act.status === "deleted",
    )

    if (allDeletedInGroup) {
      // グループ内の全ての活動が削除済みの場合、
      // - ただし "added" (一時追加) の活動は元の記録ではないため合算に含めない
      // - 元の（persisted）活動が存在する場合のみマージされた削除表示を行う
      // 一時追加レコードは id が `tmp-` で始まるので、それを基準に除外する。
      // なぜなら、追加後に削除操作で status が 'deleted' に変わると元の 'added' 情報が失われるため。
      const persistedItems = group.filter(act => !String(act.id).startsWith("tmp-"))
      const persistedDeletedSum = persistedItems.reduce(
        (sum, act) => sum + (act.period || 0),
        0,
      )

      // もし persisted な活動が一つもなければ（すべて一時追加→削除されたケース）表示しない
      if (persistedDeletedSum > 0) {
        const mergedDeletedActivity: DailyActivityItem = {
          ...group[0], // ベースにする（表示用）
          id: `merged-deleted-${period}-${group.map(a => a.id).join("-")}`,
          period: persistedDeletedSum, // persisted な削除分のみ合算
          isDeleted: true,
          status: "deleted",
          // persistedItems に基づいて最終更新・作成時刻を決定
          updatedAt: persistedItems.reduce((latest, current) => {
            const latestDate = latest || ""
            const currentDate = current.updatedAt || ""
            return new Date(latestDate) > new Date(currentDate) ? latestDate : currentDate
          }, persistedItems[0].updatedAt || ""),
          createAt: persistedItems.reduce((earliest, current) => {
            const earliestDate = earliest || ""
            const currentDate = current.createAt || ""
            return new Date(earliestDate) < new Date(currentDate)
              ? earliestDate
              : currentDate
          }, persistedItems[0].createAt),
        }
        displayItems.push(mergedDeletedActivity)
      }
    } else {
      // グループ内にアクティブな活動が1つでも含まれる場合、個々の活動をそのまま表示
      displayItems.push(...group)
    }
  })

  displayItems.sort((a, b) => {
    if (a.createAt === b.createAt) {
      return 0
    }
    return new Date(a.createAt).getTime() - new Date(b.createAt).getTime()
  })

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-600/50 dark:bg-slate-900/75"
      data-testid="daily-activity-modal"
    >
      <div
        className={style.card.container({ class: "mx-4 w-full max-w-md" })}
        data-testid="daily-activity-card"
      >
        <h2 className={style.text.sectionTitle({ class: "mb-4 text-xl" })}>
          {date ? format(date, "yyyy年MM月dd日") : "日付不明"} の記録
        </h2>
        <div
          className="mb-4 flex max-h-80 flex-col overflow-y-auto"
          data-testid="daily-activity-list"
        >
          {dailyActivities.filter(act => !act.isDeleted && act.status !== "deleted")
            .length === 0 && (
            <p className={style.text.info()} data-testid="daily-activity-empty">
              この日の活動記録がありません。
            </p>
          )}
          {displayItems.map((act, index) => {
            const isMergedDeletedDisplay = act.id.startsWith("merged-deleted-")

            return (
              <div
                key={act.id}
                className={style.record.activityStatusStyles({
                  class:
                    "flex items-center border-b border-slate-200 py-0.5 dark:border-slate-600",
                  status:
                    act.isDeleted || act.status === "deleted"
                      ? "deleted"
                      : act.status || "unchanged",
                })}
                data-testid={`daily-activity-item-${index}`}
              >
                {!isMergedDeletedDisplay && ( // マージされた削除活動でない場合のみ表示
                  <button
                    onClick={() => handleDeleteActivity(act.id)}
                    className="mx-1 rounded-full p-1 transition-colors hover:bg-red-100 sm:mx-3 dark:hover:bg-red-900/60"
                    title="削除"
                    data-testid="delete-record"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-red-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
                <input
                  type="number"
                  step="0.5"
                  value={act.period}
                  id={act.id}
                  min="0.5"
                  max="5"
                  onChange={e => handlePeriodChange(act.id, parseFloat(e.target.value))}
                  className={style.form.input({ className: "mr-2 w-20" })}
                  data-testid={`input-record`}
                  disabled={
                    act.isDeleted || act.status === "deleted" || isMergedDeletedDisplay
                  } // 個別の削除活動またはマージされた削除活動の場合無効化
                />
                <span className="text-slate-900 dark:text-white">時間</span>
                <span
                  className={style.text.info({ class: "ml-auto items-end font-mono" })}
                >
                  {toLocalJPString(
                    new Date(act.updatedAt ? act.updatedAt : act.createAt),
                  )}
                </span>
              </div>
            )
          })}
          <button
            onClick={handleAddActivity}
            className="flex cursor-pointer items-center border-b border-slate-200 py-0.5 dark:border-slate-600"
            style={{ minHeight: "48px" }}
            data-testid={`add-record`}
          >
            <div className="mx-1 rounded-full p-1 transition-colors hover:bg-blue-100 sm:mx-3 dark:hover:bg-blue-900">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </div>
            記録を追加
          </button>
        </div>
        <div className="mt-6 flex items-center">
          <button
            onClick={onClose}
            className={style.button({ type: "secondary", className: "mr-auto" })}
            data-testid="back-button"
          >
            戻る
          </button>
          <button
            onClick={handleSave}
            className={style.button({ type: "primary", className: "place-items-start" })}
            data-testid="save-record"
          >
            一時保存
          </button>
        </div>
      </div>
    </div>
  )
}

export default DailyActivity
