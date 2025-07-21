import { format } from "date-fns"
import React, { useEffect, useState } from "react"

import { toLocalJPString } from "../../lib/utils"

import type { ActivityType } from "~/db/schema"
import { style } from "~/styles/component"

interface DailyActivityItem extends ActivityType {
  isDeleted?: boolean
}

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
  const [dailyActivities, setDailyActivities] = useState<DailyActivityItem[]>(activities)

  useEffect(() => {
    setDailyActivities(activities)
  }, [activities])

  const handlePeriodChange = (index: number, newPeriod: number) => {
    setDailyActivities(prev =>
      prev.map((act, i) => (i === index ? { ...act, period: newPeriod } : act)),
    )
  }

  const handleAddActivity = () => {
    if (!date) return
    setDailyActivities(prev => [
      ...prev,
      {
        id: `tmp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        userId,
        date: format(date, "yyyy-MM-dd"),
        period: 1.5,
        createAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isDeleted: false,
      } as DailyActivityItem,
    ])
  }

  const handleDeleteActivity = (id: DailyActivityItem["id"]) => {
    setDailyActivities(prev =>
      prev.map(act => (act.id === id ? { ...act, isDeleted: true } : act)),
    )
  }

  const handleSave = () => {
    onSave(dailyActivities)
  }

  return (
    <div className="fixed inset-0 bg-slate-600/50 dark:bg-slate-900/75 flex justify-center items-center z-50">
      <div className={style.card.container({ class: "max-w-md w-full mx-4" })}>
        <h2 className={style.text.sectionTitle({ class: "text-xl mb-4" })}>
          {date ? format(date, "yyyy年MM月dd日") : "日付不明"} の記録
        </h2>
        <div className="flex flex-col max-h-80 overflow-y-auto mb-4">
          {dailyActivities.filter(act => !act.isDeleted).length === 0 && (
            <p className={style.text.info()}>この日の活動記録がありません。</p>
          )}
          {dailyActivities
            .filter(act => !act.isDeleted)
            .map((act, index) => (
              <div
                key={act.id}
                className="flex items-center py-0.5 border-b border-slate-200 dark:border-slate-600"
              >
                <button
                  onClick={() => handleDeleteActivity(act.id)}
                  className="p-1 mx-1 sm:mx-3 rounded-full hover:bg-red-100 dark:hover:bg-red-900/60 transition-colors"
                  title="削除"
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
                <input
                  type="number"
                  step="0.5"
                  value={act.period}
                  id={act.id}
                  onChange={e => handlePeriodChange(index, parseFloat(e.target.value))}
                  className={style.form.input({ className: "w-20 mr-2" })}
                />
                <span className="text-slate-900 dark:text-white">時間</span>
                <span
                  className={style.text.info({ class: "items-end ml-auto font-mono" })}
                >
                  {toLocalJPString(
                    new Date(act.updatedAt ? act.updatedAt : act.createAt),
                  )}
                </span>
              </div>
            ))}
          <button
            onClick={handleAddActivity}
            className="flex items-center py-0.5 border-b border-slate-200 dark:border-slate-600 cursor-pointer"
            style={{ minHeight: "48px" }}
          >
            <div className="p-1 mx-1 sm:mx-3 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors">
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
        <div className="flex items-center mt-6">
          <button
            onClick={onClose}
            className={style.button({ type: "secondary", className: "mr-auto" })}
          >
            戻る
          </button>
          <button
            onClick={handleSave}
            className={style.button({ type: "primary", className: "place-items-start" })}
          >
            一時保存
          </button>
        </div>
      </div>
    </div>
  )
}

export default DailyActivity
