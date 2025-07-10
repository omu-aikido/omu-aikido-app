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
  const [isChanged, setIsChanged] = useState(false)
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
      setOriginalActivities(withDeletedFlag)
      setIsChanged(false)
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
    const dateToUpdate = selectedDate ? format(selectedDate, "yyyy-MM-dd") : null
    if (!dateToUpdate) return
    const filteredPrevActivities = activities.filter((act) => act.date !== dateToUpdate)
    const newActivities = [...filteredPrevActivities, ...updatedDailyActivities]
    setActivities(newActivities)

    const groupByDate = (arr: DailyActivityItem[]) => {
      const map = new Map<string, { count: number; total: number }>()
      arr
        .filter((a) => !a.isDeleted)
        .forEach((a) => {
          const d = a.date
          if (!map.has(d)) map.set(d, { count: 0, total: 0 })
          const v = map.get(d)!
          map.set(d, {
            count: v.count + 1,
            total: v.total + (typeof a.period === "number" ? a.period : 0),
          })
        })
      return map
    }
    const mapNew = groupByDate(newActivities)
    const mapOrig = groupByDate(originalActivities)
    let changed = false
    const allDates = new Set([...mapNew.keys(), ...mapOrig.keys()])
    for (const d of allDates) {
      const n = mapNew.get(d) || { count: 0, total: 0 }
      const o = mapOrig.get(d) || { count: 0, total: 0 }
      if (n.count !== o.count || n.total !== o.total) {
        changed = true
        break
      }
    }
    setIsChanged(changed)
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

      // 差分抽出の効率化（内容完全一致でペアリングして除外）
      const compareFields: (keyof DailyActivityItem)[] = ["date", "period", "userId"]
      const isContentEqual = (a: DailyActivityItem, b: DailyActivityItem) =>
        compareFields.every((key) => a[key] === b[key])

      // 1. 削除候補: originalに存在し、activitiesでisDeleted:true または activitiesに存在しない
      const deletedCandidates = originalActivities.filter((oa) => {
        const currentActivity = activities.find((a) => a.id === oa.id)
        return !currentActivity || currentActivity.isDeleted
      })
      // 2. 追加候補: idなし or idがtmp- or originalに存在しない、isDeleted:false
      const addedCandidates = activities.filter(
        (a) =>
          (!a.id ||
            (typeof a.id === "string" && a.id.startsWith("tmp-")) ||
            !originalActivities.some((oa) => oa.id === a.id)) &&
          !a.isDeleted,
      )
      // 3. 内容一致でペアリング
      const matchedPairs: { delIdx: number; addIdx: number }[] = []
      deletedCandidates.forEach((del, delIdx) => {
        const addIdx = addedCandidates.findIndex((add) => isContentEqual(add, del))
        if (addIdx !== -1) {
          matchedPairs.push({ delIdx, addIdx })
        }
      })
      // 除外した追加・削除候補を除いたリストを作成
      const filteredDeleted = deletedCandidates.filter(
        (_, idx) => !matchedPairs.some((m) => m.delIdx === idx),
      )
      const filteredAdded = addedCandidates.filter(
        (_, idx) => !matchedPairs.some((m) => m.addIdx === idx),
      )

      // 通常の差分抽出
      const activitiesToAdd: ActivityType[] = filteredAdded.map((a) => ({
        ...stripIsDeleted(a),
        id: typeof a.id === "string" && a.id.startsWith("tmp-") ? "" : a.id,
      }))
      const activitiesToUpdate: ActivityType[] = []
      const activitiesToDelete: string[] = filteredDeleted.map((a) => a.id!).filter(Boolean)

      activities.forEach((currentAct) => {
        const originalAct = originalActivities.find((oa) => oa.id === currentAct.id)
        if (originalAct && !currentAct.isDeleted) {
          const fieldsToCompare: (keyof DailyActivityItem)[] = ["date", "period", "userId"]
          const hasChanges = fieldsToCompare.some(
            (field) => originalAct[field] !== currentAct[field],
          )

          if (hasChanges) {
            activitiesToUpdate.push(stripIsDeleted(currentAct))
          }
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

      let responseData
      try {
        await res.clone().json()
      } catch {
        setError("不正なレスポンスです。")
      }
      if (!res.ok) {
        setError(`サーバエラー`)
        return
      }

      setTimeout(() => {
        window.location.reload()
      }, 1500) // 成功メッセージを表示してからリロード
      setIsChanged(false)
    } catch (error) {
      setError(`一括登録中にエラーが発生しました`)
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200 relative">
      {/* ローディング時の全体カバー（コンポーネント内限定） */}
      {loading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center bg-slate-50 dark:bg-slate-900 p-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mb-4"></div>
          <p className="text-slate-900 dark:text-slate-200 text-lg font-semibold drop-shadow">
            読み込み中...
          </p>
        </div>
      )}
      <div className="">
        <div className="">
          <div className="flex flex-row justify-between items-center mb-4 sm:mb-8 gap-2">
            <button
              onClick={handlePrevMonth}
              className="bg-blue-400 hover:bg-blue-600 dark:bg-blue-500 dark:hover:bg-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors duration-200 shadow-sm"
            >
              ← 前月
            </button>
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white">
              {format(currentMonth, "yyyy年MM月")}
            </h2>
            <button
              onClick={handleNextMonth}
              className="bg-blue-400 hover:bg-blue-600 dark:bg-blue-500 dark:hover:bg-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors duration-200 shadow-sm"
            >
              次月 →
            </button>
          </div>
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <p className="text-red-600 dark:text-red-400 text-center">エラー: {error}</p>
            </div>
          )}
          <div className="overflow-x-auto w-full sm:block hidden">
            <button
              onClick={handleBatchUpdate}
              className={`w-full flex-row px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors duration-200 shadow-sm ${isChanged ? "bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white" : "bg-gray-300 dark:bg-gray-700 text-gray-400 cursor-not-allowed"}`}
              disabled={!isChanged}
            >
              一括登録
            </button>
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
                          key={act.id || `tmp-${i}`}
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
                    <div className="w-20 flex-shrink-0 font-semibold text-slate-700 dark:text-slate-300">
                      {`${format(day, "d日")} (${["日", "月", "火", "水", "木", "金", "土"][day.getDay()]})`}
                    </div>
                    <div className="flex-1 space-y-1">
                      {acts.length === 0 ? (
                        <span className="text-slate-400 text-sm">記録なし</span>
                      ) : (
                        acts.map((act, i) => (
                          <span
                            key={act.id || `tmp-${i}`}
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
            <button
              onClick={handleBatchUpdate}
              className={`fixed bottom-6 right-6 z-50 px-6 py-3 rounded-full font-medium transition-all duration-200 shadow-lg hover:shadow-xl ${isChanged ? "bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white" : "bg-gray-300 dark:bg-gray-700 text-gray-400 cursor-not-allowed"}`}
              disabled={!isChanged}
            >
              一括登録
            </button>
          </div>
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
