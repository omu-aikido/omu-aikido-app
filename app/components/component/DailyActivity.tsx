import { format } from "date-fns"
import React, { useEffect, useState } from "react"

import type { ActivityType } from "~/db/schema"

interface DailyActivityItem extends ActivityType {
  isDeleted?: boolean
}

interface DailyActivityProps {
  userId: string
  date: Date | null // ここを Date | null に変更
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
    if (!date) return // dateがnullの場合のハンドリングを追加
    setDailyActivities(prev => [
      ...prev,
      {
        id: `tmp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        userId,
        date: format(date, "yyyy-MM-dd"),
        period: 1.5,
        createAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isDeleted: false, // 新しいアクティビティは削除済みではない
      } as DailyActivityItem,
    ])
  }

  const handleDeleteActivity = (id: DailyActivityItem["id"]) => {
    setDailyActivities(prev => prev.map(act => (act.id === id ? { ...act, isDeleted: true } : act)))
  }

  const handleSave = () => {
    onSave(dailyActivities)
  }

  return (
    <div className="fixed inset-0 bg-slate-600/50 dark:bg-slate-900/75 flex justify-center items-center z-50">
      <div className="flex flex-col bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl shadow-2xl max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">
          {date ? format(date, "yyyy年MM月dd日") : "日付不明"} の記録
        </h2>
        <div className="flex flex-col max-h-80 overflow-y-auto mb-4">
          {dailyActivities.filter(act => !act.isDeleted).length === 0 && (
            <p className="text-slate-600 dark:text-slate-400">この日の活動記録がありません。</p>
          )}
          {dailyActivities
            .filter(act => !act.isDeleted)
            .map(act => (
              <div
                key={act.id}
                className="flex items-center py-0.5 border-b border-slate-200 dark:border-slate-600"
              >
                <button
                  onClick={() => handleDeleteActivity(act.id)}
                  className="p-1 mx-3 rounded-full hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
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
                  onChange={e =>
                    handlePeriodChange(
                      dailyActivities.findIndex(a => a.id === act.id),
                      parseFloat(e.target.value),
                    )
                  }
                  className="border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white p-2 rounded w-20 focus:outline-none focus:ring-2 focus:ring-blue-500 mr-2"
                />
                <span className="text-slate-900 dark:text-white">時間</span>
              </div>
            ))}
          <button
            onClick={handleAddActivity}
            className="flex items-center py-0.5 border-b border-slate-200 dark:border-slate-600 cursor-pointer"
            style={{ minHeight: "48px" }}
          >
            <div className="p-1 mx-3 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors">
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
            className="bg-slate-300 hover:bg-slate-400 dark:bg-slate-600 dark:hover:bg-slate-700 text-slate-800 dark:text-white px-4 py-2 rounded transition-colors mr-auto cursor-pointer"
          >
            戻る
          </button>
          <button
            onClick={handleSave}
            className="bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white px-4 py-2 rounded transition-colors place-items-start cursor-pointer"
          >
            一時保存
          </button>
        </div>
      </div>
    </div>
  )
}

export default DailyActivity
