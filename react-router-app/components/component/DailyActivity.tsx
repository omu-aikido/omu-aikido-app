import React, { useState, useEffect } from "react"
import { format } from "date-fns"
import type { ActivityType } from "db/schema" // 型のみのインポートに修正
import { useAuth } from "@clerk/astro/react"

interface DailyActivityProps {
  date: Date
  activities: ActivityType[]
  onSave: (updatedActivities: ActivityType[]) => void
  onClose: () => void
}

const DailyActivity: React.FC<DailyActivityProps> = ({ date, activities, onSave, onClose }) => {
  const [dailyActivities, setDailyActivities] = useState<ActivityType[]>(activities)
  const userId = useAuth().userId || ""

  useEffect(() => {
    setDailyActivities(activities)
  }, [activities])

  const handlePeriodChange = (index: number, newPeriod: number) => {
    setDailyActivities((prev) =>
      prev.map((act, i) => (i === index ? { ...act, period: newPeriod } : act)),
    )
  }

  const handleAddActivity = () => {
    setDailyActivities((prev) => [
      ...prev,
      {
        id: "",
        userId: userId,
        date: format(date, "yyyy-MM-dd"),
        period: 1.5,
        createAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as ActivityType,
    ])
  }

  const handleDeleteActivity = (index: number) => {
    setDailyActivities((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSave = () => {
    onSave(dailyActivities)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-slate-600 bg-opacity-50 dark:bg-slate-900 dark:bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">
          {format(date, "yyyy年MM月dd日")} のアクティビティ
        </h2>
        {dailyActivities.length === 0 && (
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            この日のアクティビティはありません。
          </p>
        )}
        {dailyActivities.map((act, index) => (
          <div key={act.id || `new-${index}`} className="flex items-center mb-2">
            <input
              type="number"
              step="0.5"
              value={act.period}
              onChange={(e) => handlePeriodChange(index, parseFloat(e.target.value))}
              className="border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white p-2 rounded w-24 mr-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="mr-auto text-slate-900 dark:text-white">時間</span>
            <button
              onClick={() => handleDeleteActivity(index)}
              className="bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white px-3 py-1 rounded transition-colors"
            >
              削除
            </button>
          </div>
        ))}
        <button
          onClick={handleAddActivity}
          className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors mt-4 mr-2"
        >
          追加
        </button>
        <button
          onClick={handleSave}
          className="bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white px-4 py-2 rounded transition-colors mt-4 mr-2"
        >
          保存
        </button>
        <button
          onClick={onClose}
          className="bg-slate-300 hover:bg-slate-400 dark:bg-slate-600 dark:hover:bg-slate-700 text-slate-800 dark:text-white px-4 py-2 rounded transition-colors mt-4"
        >
          閉じる
        </button>
      </div>
    </div>
  )
}

export default DailyActivity
