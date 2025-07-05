import React, { useState, useEffect, useCallback } from "react"
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

import DailyActivity from "./DailyActivity"
function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false)
  React.useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 640)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])
  return isMobile
}

function MonthlyActivityForm() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [activities, setActivities] = useState<ActivityType[]>([])
  const [originalActivities, setOriginalActivities] = useState<ActivityType[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDailyActivityModal, setShowDailyActivityModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const isMobile = useIsMobile()

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
      setActivities(data)
      setOriginalActivities(JSON.parse(JSON.stringify(data))) // ディープコピー
    } catch {
      setError("エラーが発生しました")
    } finally {
      setLoading(false)
    }
  }, [currentMonth])

  useEffect(() => {
    fetchActivities()
  }, [fetchActivities])

  const handleSaveDailyActivities = async (updatedDailyActivities: ActivityType[]) => {
    const activitiesToUpsert: ActivityType[] = []

    updatedDailyActivities.forEach((updatedAct) => {
      const originalAct = originalActivities.find((oa) => oa.id === updatedAct.id)
      if (originalAct) {
        if (JSON.stringify(originalAct) !== JSON.stringify(updatedAct)) {
          activitiesToUpsert.push(updatedAct)
        }
      } else {
        activitiesToUpsert.push(updatedAct)
      }
    })

    if (activitiesToUpsert.length === 0) {
      setShowDailyActivityModal(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/me/activities/batch", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(activitiesToUpsert),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      await response.json() // 成功レスポンスをパース
      fetchActivities() // データ再取得
      setShowDailyActivityModal(false)
    } catch {
      setError("エラーが発生しました。")
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
    ? activities.filter((act) => isSameDay(new Date(act.date), selectedDate))
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

          {!isMobile ? (
            <div className="overflow-x-auto w-full">
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
                        .filter((act) => isSameDay(new Date(act.date), day))
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
          ) : (
            <div className="w-full">
              <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                {daysInMonth.map((day, idx) => {
                  const acts = activities.filter((act) => isSameDay(new Date(act.date), day))
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
          )}
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
