import { useState, useEffect, useCallback } from "react"
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns"
import type { ActivityType } from "@/./db/schema"
import { useAuth } from "@clerk/astro/react"
import type { BatchRequestBody } from "@/./src/pages/api/me/activities/batch"

import DailyActivity from "./DailyActivity"
interface DailyActivityItem extends ActivityType {
  isDeleted?: boolean
}

function stripIsDeleted<T extends { isDeleted?: boolean }>(obj: T): ActivityType {
  const { ...rest } = obj
  return rest as unknown as ActivityType
}

function MonthlyActivityForm() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [activities, setActivities] = useState<DailyActivityItem[]>([])
  const [originalActivities, setOriginalActivities] = useState<DailyActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDailyActivityModal, setShowDailyActivityModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const { userId } = useAuth()

  const fetchActivities = useCallback(async () => {
    setLoading(true)
    setError(null)
    const startDate = format(startOfMonth(currentMonth), "yyyy-MM-dd")
    const endDate = format(endOfMonth(currentMonth), "yyyy-MM-dd")

    try {
      const response = await fetch(`/api/me/activities?startDate=${startDate}&endDate=${endDate}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data: ActivityType[] = await response.json()
      const withDeletedFlag = data.map((act) => ({
        ...(act as DailyActivityItem),
        isDeleted: false,
      }))
      setActivities(withDeletedFlag)
      setOriginalActivities(JSON.parse(JSON.stringify(withDeletedFlag)))
    } catch {
      setError("エラーが発生しました")
    } finally {
      setLoading(false)
    }
  }, [currentMonth])

  useEffect(() => {
    if (userId) {
      fetchActivities()
    }
  }, [fetchActivities, userId])

  // DailyActivityから受け取った全アクティビティ（isDeleted含む）で上書き
  const handleSaveDailyActivities = (updatedDailyActivities: DailyActivityItem[]) => {
    setActivities((prevActivities) => {
      const dateToUpdate = selectedDate ? format(selectedDate, "yyyy-MM-dd") : null
      if (!dateToUpdate) {
        return prevActivities
      }

      const filteredPrevActivities = prevActivities.filter((act) => act.date !== dateToUpdate)

      return [...filteredPrevActivities, ...updatedDailyActivities]
    })
    setShowDailyActivityModal(false)
  }

  const handleBatchUpdate = async () => {
    setLoading(true)
    setError(null)
    try {
      if (!userId) {
        setError("ユーザーIDが取得できませんでした。")
        setLoading(false)
        return
      }

      // 追加・更新・削除をisDeletedで判定
      const activitiesToAdd: ActivityType[] = []
      const activitiesToUpdate: ActivityType[] = []
      const activitiesToDelete: string[] = []

      activities.forEach((currentAct) => {
        const originalAct = originalActivities.find((oa) => oa.id === currentAct.id)
        if (currentAct.isDeleted) {
          if (currentAct.id && !activitiesToDelete.includes(currentAct.id)) {
            activitiesToDelete.push(currentAct.id)
          }
        } else if (originalAct) {
          if (
            JSON.stringify({ ...originalAct, isDeleted: undefined }) !==
            JSON.stringify(stripIsDeleted(currentAct))
          ) {
            activitiesToUpdate.push(stripIsDeleted(currentAct))
          }
        } else {
          activitiesToAdd.push({
            ...stripIsDeleted(currentAct),
            id:
              typeof currentAct.id === "string" && currentAct.id.startsWith("tmp-")
                ? ""
                : currentAct.id,
          })
        }
      })

      const payload: BatchRequestBody = {
        userId: userId,
        added: activitiesToAdd,
        updated: activitiesToUpdate,
        deleted: activitiesToDelete,
      }

      const res = await fetch("/api/me/activities/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      try {
        await res.clone().json()
      } catch {
        setError("不正なレスポンスです。")
      }
      if (!res.ok) {
        setError("サーバエラー")
        return
      }

      fetchActivities()
    } catch {
      setError("一括登録中にエラーが発生しました。")
    } finally {
      setLoading(false)
    }
  }

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  })

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  const handleDayClick = (date: Date) => {
    setSelectedDate(date)
    setShowDailyActivityModal(true)
  }

  const dailyActivitiesForSelectedDate = selectedDate
    ? activities.filter((act) => act.date === format(selectedDate, "yyyy-MM-dd"))
    : []

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
      <div className="">
        <div className="">
          <div className="flex flex-row justify-between items-center mb-4 sm:mb-8 gap-2">
            <button
              onClick={handlePrevMonth}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors duration-200 shadow-sm"
            >
              ← 前月
            </button>
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white">
              {format(currentMonth, "yyyy年MM月")}
            </h2>
            <button
              onClick={handleNextMonth}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors duration-200 shadow-sm"
            >
              次月 →
            </button>
          </div>
          <button
            onClick={handleBatchUpdate}
            className="w-full flex-row  bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors duration-200 shadow-sm"
          >
            一括登録
          </button>
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
              <p className="text-slate-600 dark:text-slate-400">読み込み中...</p>
            </div>
          )}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <p className="text-red-600 dark:text-red-400 text-center">エラー: {error}</p>
            </div>
          )}
          <div className="overflow-x-auto w-full sm:block hidden">
            <div className="min-w-[700px] grid grid-cols-7 gap-0">
              {["日", "月", "火", "水", "木", "金", "土"].map((day, index) => (
                <div
                  key={day}
                  className={`font-bold text-center py-2 sm:py-4 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-600 ${
                    index === 0
                      ? "text-red-600 dark:text-red-400"
                      : index === 6
                        ? "text-blue-600 dark:text-blue-400"
                        : ""
                  }`}
                >
                  {day}
                </div>
              ))}
              {daysInMonth.map((day, index) => (
                <div
                  key={index}
                  className={`p-1 sm:p-3 border-r border-b border-slate-200 dark:border-slate-600 cursor-pointer min-h-[60px] sm:min-h-[100px] transition-colors duration-200 ${
                    isSameDay(day, new Date())
                      ? "bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-600"
                      : "bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600"
                  }`}
                  onClick={() => handleDayClick(day)}
                >
                  <div
                    className={`font-semibold mb-1 sm:mb-2 ${
                      isSameDay(day, new Date())
                        ? "text-blue-700 dark:text-blue-300"
                        : "text-slate-900 dark:text-slate-100"
                    }`}
                  >
                    {format(day, "d")}
                  </div>
                  <div className="space-y-1">
                    {activities
                      .filter((act) => act.date === format(day, "yyyy-MM-dd") && !act.isDeleted)
                      .map((act, i) => (
                        <div
                          key={i}
                          className="text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-1 rounded-full font-medium"
                        >
                          {act.period}h
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="w-full block sm:hidden">
            <ul className="divide-y divide-slate-200 dark:divide-slate-700">
              {daysInMonth.map((day, idx) => {
                const acts = activities.filter(
                  (act) => act.date === format(day, "yyyy-MM-dd") && !act.isDeleted,
                )
                return (
                  <li
                    key={idx}
                    className="flex items-start py-3 px-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    onClick={() => handleDayClick(day)}
                  >
                    <div className="w-20 flex-shrink-0 font-semibold text-blue-700 dark:text-blue-300">
                      {`${format(day, "d日")} (${["日", "月", "火", "水", "木", "金", "土"][day.getDay()]})`}
                    </div>
                    <div className="flex-1 space-y-1">
                      {acts.length === 0 ? (
                        <span className="text-slate-400 text-sm">記録なし</span>
                      ) : (
                        acts.map((act, i) => (
                          <span
                            key={i}
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
          </div>

          <button
            onClick={handleBatchUpdate}
            className="w-full flex-row  bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors duration-200 shadow-sm"
          >
            一括登録
          </button>
        </div>
      </div>

      {showDailyActivityModal && selectedDate && (
        <DailyActivity
          date={selectedDate}
          activities={dailyActivitiesForSelectedDate}
          onSave={handleSaveDailyActivities}
          onClose={() => setShowDailyActivityModal(false)}
        />
      )}
    </div>
  )
}

export default MonthlyActivityForm
