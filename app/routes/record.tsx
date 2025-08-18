import { getAuth } from "@clerk/react-router/ssr.server"
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  startOfMonth,
  subMonths,
} from "date-fns"
import { useEffect, useMemo, useState } from "react"
import { redirect, useActionData, useFetcher, useSearchParams } from "react-router"

import MonthlyActivityList from "../components/component/MonthlyActivityList"
import MonthlyCalendarGrid from "../components/component/MonthlyCalendarGrid"
import MonthNavigation from "../components/component/MonthNavigation"

import type { Route } from "./+types/record"

import DailyActivity from "~/components/component/DailyActivity"
import TabBarScrollHide  from "~/components/component/TabBarScrollHide"
import YearMonthSelectorInline from "~/components/component/YearMonthSelector"
import type { ActivityType } from "~/db/schema"
import {
  createActivities,
  deleteActivities,
  getActivitiesByDateRange,
  updateActivities,
} from "~/lib/query/activity"
import { style } from "~/styles/component"
import type { DailyActivityItem } from "~/type"

// MARK: Loader
export async function loader(args: Route.LoaderArgs) {
  const { request, context } = args
  const auth = await getAuth(args)
  const userId = auth.userId!

  if (!userId) throw new Error("User not authenticated")

  const url = new URL(request.url)
  const currentMonth = url.searchParams.get("month") || format(new Date(), "yyyy-MM")
  const [year, month] = currentMonth.split("-")
  const date = new Date(parseInt(year), parseInt(month) - 1)

  const startDate = startOfMonth(date).toISOString()
  const endDate = endOfMonth(date).toISOString()

  try {
    const activities: ActivityType[] = await getActivitiesByDateRange({
      userId,
      startDate,
      endDate,
      env: context.cloudflare.env,
    })

    return {
      userId,
      activities: activities.map(act => ({ ...act, isDeleted: false })),
      currentMonth: format(date, "yyyy-MM"),
    }
  } catch {
    return {
      userId,
      currentMonth: format(date, "yyyy-MM"),
      error: "データの取得に失敗しました",
    }
  }
}

// MARK: Meta
export function meta(args: Route.MetaArgs) {
  return [
    { title: `${args.data?.currentMonth ?? "1ヶ"}月の記録 | ハム大合気ポータル` },
    { name: "description", content: "1カ月毎の記録を一覧できます。" },
  ]
}

// MARK: Action
export async function action(args: Route.ActionArgs) {
  const { request, context } = args
  const formData = await request.formData()
  const actionType = formData.get("actionType")
  const auth = await getAuth(args)
  const userId = auth.userId!

  if (actionType === "batchUpdate") {
    const payload = JSON.parse(formData.get("payload") as string)

    try {
      if (payload.added && payload.added.length > 0) {
        await createActivities({
          userId,
          activities: payload.added,
          env: context.cloudflare.env,
        })
      }
      if (payload.updated && payload.updated.length > 0) {
        await updateActivities({
          userId,
          activities: payload.updated,
          env: context.cloudflare.env,
        })
      }
      if (payload.deleted && payload.deleted.length > 0) {
        await deleteActivities({
          userId,
          ids: payload.deleted,
          env: context.cloudflare.env,
        })
      }

      return redirect(`/record?month=${formData.get("currentMonth")}`)
    } catch {
      return { error: `登録に失敗しました。` }
    }
  }

  return null
}

// MARK: Component
export default function MonthlyActivityForm({ loaderData }: Route.ComponentProps) {
  // totalPeriod を受け取る
  const {
    userId,
    activities: initialActivities,
    currentMonth: loadedMonth,
    error: loaderError,
  } = loaderData
  const actionData = useActionData<typeof action>()
  const fetcher = useFetcher()

  const [originalActivities, setOriginalActivities] = useState<DailyActivityItem[]>(
    initialActivities || [],
  )
  const [currentActivities, setActivities] = useState<DailyActivityItem[]>(
    initialActivities || [],
  )

  useEffect(() => {
    setOriginalActivities(initialActivities || [])
    setActivities(initialActivities || [])
  }, [initialActivities])

  const error = loaderError || actionData?.error || null
  const [showDailyActivityModal, setShowDailyActivityModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  // 新しいフックを呼び出す
  const {
    currentMonth,
    handleSelectYearMonth,
    daysInMonth,
    handlePrevMonth,
    handleNextMonth,
  } = useMonthlyNavigation(loadedMonth)

  const isChanged = useMemo(() => {
    const mapNew = groupByDate(currentActivities)
    const mapOrig = groupByDate(originalActivities)
    const allDates = new Set([...mapNew.keys(), ...mapOrig.keys()])
    for (const d of allDates) {
      const n = mapNew.get(d) || { count: 0, total: 0 }
      const o = mapOrig.get(d) || { count: 0, total: 0 }
      if (n.count !== o.count || n.total !== o.total) {
        return true
      }
    }
    return false
  }, [currentActivities, originalActivities])

  const handleSaveDailyActivities = (updatedDailyActivities: DailyActivityItem[]) => {
    const dateToUpdate = selectedDate ? format(selectedDate, "yyyy-MM-dd") : null
    if (!dateToUpdate) return
    const filteredPrevActivities = currentActivities.filter(
      act => act.date !== dateToUpdate,
    )
    const newActivities = [...filteredPrevActivities, ...updatedDailyActivities]
    setActivities(newActivities)
    setShowDailyActivityModal(false)
  }

  const handleDayClick = (date: Date) => {
    setSelectedDate(date)
    setShowDailyActivityModal(true)
  }

  const dailyActivitiesForSelectedDate = selectedDate
    ? currentActivities.filter(act => act.date === format(selectedDate, "yyyy-MM-dd"))
    : []

  return (
    <div
      className="min-h-screen transition-colors duration-200 relative"
      data-testid="record-page-container"
    >
      <>
        <h1 className={style.text.sectionTitle()} data-testid="record-title">
          記録一覧
        </h1>
        {error && (
          <div
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-800 rounded-lg p-4 mb-6"
            data-testid="record-error-container"
          >
            <p
              className="text-red-600 dark:text-red-400 text-center"
              data-testid="record-error-message"
            >
              エラー: {error}
            </p>
          </div>
        )}
        <MonthNavigation
          isChanged={isChanged}
          currentMonth={currentMonth}
          onPrev={handlePrevMonth}
          onNext={handleNextMonth}
          onSelect={handleSelectYearMonth}
          YearMonthSelector={YearMonthSelectorInline}
        />
        <div className="overflow-x-auto w-full sm:block hidden">
          <fetcher.Form method="post">
            <div className="flex flex-row items-center justify-between mb-4">
              <button
                type="submit"
                className="rounded-lg font-medium transition-colors duration-200 shadow-sm p-3 mb-4 mx-1 w-full bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white disabled:bg-gray-300 disabled:dark:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                disabled={!isChanged || fetcher.state !== "idle"}
                data-testid="submit-button"
              >
                {fetcher.state === "idle"
                  ? "登録"
                  : fetcher.state === "loading"
                    ? "読み込み中"
                    : "送信中"}
              </button>
              <button
                type="button"
                onClick={() => {
                  alert("変更をリセットします。よろしいですか？")
                  setActivities(originalActivities)
                  setSelectedDate(null)
                  setShowDailyActivityModal(false)
                }}
                className="rounded-lg font-medium transition-colors duration-200 shadow-sm p-3 mb-4 mx-1 w-1/4 bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 text-white disabled:bg-gray-300 disabled:dark:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                disabled={!isChanged || fetcher.state !== "idle"}
                data-testid="record-button-reset"
              >
                リセット
              </button>
            </div>
            <input type="hidden" name="actionType" value="batchUpdate" />
            <input
              type="hidden"
              name="currentMonth"
              value={format(currentMonth, "yyyy-MM")}
            />
            <input
              type="hidden"
              name="payload"
              value={JSON.stringify(
                prepareBatchUpdatePayload(userId, originalActivities, currentActivities),
              )}
            />
            <MonthlyCalendarGrid
              daysInMonth={daysInMonth}
              currentActivities={currentActivities}
              onDayClick={handleDayClick}
            />
          </fetcher.Form>
        </div>
        <div className="w-full block sm:hidden">
          <MonthlyActivityList
            daysInMonth={daysInMonth}
            currentActivities={currentActivities}
            onDayClick={handleDayClick}
            data-testid="monthly-activity-list"
          />
          <fetcher.Form method="post">
            <input type="hidden" name="actionType" value="batchUpdate" />
            <input
              type="hidden"
              name="currentMonth"
              value={format(currentMonth, "yyyy-MM")}
            />
            <input
              type="hidden"
              name="payload"
              value={JSON.stringify(
                prepareBatchUpdatePayload(userId, originalActivities, currentActivities),
              )}
            />
            <div className="fixed w-full right-0 bottom-0">
              <div className="flex flex-row items-center justify-between backdrop-blur-sm pb-5 px-3">
                <button
                  type="button"
                  onClick={() => {
                    alert("変更をリセットします。よろしいですか？")
                    setActivities(originalActivities)
                    setSelectedDate(null)
                    setShowDailyActivityModal(false)
                  }}
                  className="rounded-lg font-medium transition-colors duration-200 shadow-sm p-3 my-4 mx-1 w-1/3 bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 text-white disabled:bg-gray-300 disabled:dark:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                  disabled={!isChanged || fetcher.state !== "idle"}
                >
                  リセット
                </button>
                <button
                  type="submit"
                  className="rounded-lg font-medium transition-colors duration-200 shadow-sm p-3 my-4 mx-1 w-full bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white disabled:bg-gray-300 disabled:dark:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                  disabled={!isChanged || fetcher.state !== "idle"}
                >
                  {fetcher.state === "idle"
                    ? "登録"
                    : fetcher.state === "loading"
                      ? "読み込み中"
                      : "送信中"}
                </button>
              </div>
            </div>
          </fetcher.Form>
        </div>
      </>
      {showDailyActivityModal && selectedDate && (
        <DailyActivity
          userId={userId}
          date={selectedDate}
          activities={dailyActivitiesForSelectedDate}
          onSave={handleSaveDailyActivities}
          onClose={() => setShowDailyActivityModal(false)}
        />
      )}
    </div>
  )
}

// MARK: Helper

function useMonthlyNavigation(loadedMonth: string) {
  const [searchParams, setSearchParams] = useSearchParams()

  const currentMonth = useMemo(() => {
    const [year, month] = loadedMonth.split("-")
    return new Date(parseInt(year), parseInt(month) - 1)
  }, [loadedMonth])

  const handleSelectYearMonth = (date: Date) => {
    setSearchParams({
      ...Object.fromEntries(searchParams.entries()),
      month: format(date, "yyyy-MM"),
    })
  }

  const daysInMonth = useMemo(
    () =>
      eachDayOfInterval({
        start: startOfMonth(currentMonth),
        end: endOfMonth(currentMonth),
      }),
    [currentMonth],
  )

  const handlePrevMonth = () => {
    const newMonth = subMonths(currentMonth, 1)
    setSearchParams({
      ...Object.fromEntries(searchParams.entries()),
      month: format(newMonth, "yyyy-MM"),
    })
  }

  const handleNextMonth = () => {
    const newMonth = addMonths(currentMonth, 1)
    setSearchParams({
      ...Object.fromEntries(searchParams.entries()),
      month: format(newMonth, "yyyy-MM"),
    })
  }

  return {
    currentMonth,
    handleSelectYearMonth,
    daysInMonth,
    handlePrevMonth,
    handleNextMonth,
  }
}

function prepareBatchUpdatePayload(
  userId: string | undefined,
  originalActivities: DailyActivityItem[],
  currentActivities: DailyActivityItem[],
) {
  if (!userId) return null

  const deletedCandidates = originalActivities.filter(oa => {
    const currentActivity = currentActivities.find(a => String(a.id) === String(oa.id))
    return !currentActivity || currentActivity.isDeleted
  })

  const addedCandidates = currentActivities.filter(
    a =>
      (!a.id ||
        (typeof a.id === "string" && a.id.startsWith("tmp-")) ||
        !originalActivities.some(oa => oa.id === a.id)) &&
      !a.isDeleted,
  )

  const matchedPairs: { delIdx: number; addIdx: number }[] = []
  deletedCandidates.forEach((del, delIdx) => {
    const addIdx = addedCandidates.findIndex(add => isContentEqual(add, del))
    if (addIdx !== -1) {
      matchedPairs.push({ delIdx, addIdx })
    }
  })

  const filteredDeleted = deletedCandidates.filter(
    (_, idx) => !matchedPairs.some(m => m.delIdx === idx),
  )
  const filteredAdded = addedCandidates.filter(
    (_, idx) => !matchedPairs.some(m => m.addIdx === idx),
  )

  const activitiesToAdd: ActivityType[] = filteredAdded.map(a => ({
    ...stripIsDeleted(a),
    id: typeof a.id === "string" && a.id.startsWith("tmp-") ? "" : a.id,
  }))

  const activitiesToUpdate: ActivityType[] = []
  currentActivities.forEach(currentAct => {
    const originalAct = originalActivities.find(
      oa => String(oa.id) === String(currentAct.id),
    )
    if (originalAct && !currentAct.isDeleted) {
      const fieldsToCompare: (keyof DailyActivityItem)[] = ["date", "period", "userId"]
      const hasChanges = fieldsToCompare.some(
        field => originalAct[field] !== currentAct[field],
      )
      if (hasChanges) {
        activitiesToUpdate.push(stripIsDeleted(currentAct))
      }
    }
  })

  const activitiesToDelete: string[] = filteredDeleted.map(a => a.id!).filter(Boolean)

  return {
    userId,
    added: activitiesToAdd,
    updated: activitiesToUpdate,
    deleted: activitiesToDelete,
  }
}
function stripIsDeleted(obj: DailyActivityItem): ActivityType {
  return {
    id: obj.id,
    userId: obj.userId,
    date: obj.date,
    period: obj.period,
    createAt: obj.createAt,
    updatedAt: obj.updatedAt,
  } as ActivityType
}

const groupByDate = (arr: DailyActivityItem[]) => {
  const map = new Map<string, { count: number; total: number }>()
  arr
    .filter(a => !a.isDeleted)
    .forEach(a => {
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

const compareFields: (keyof DailyActivityItem)[] = ["date", "period", "userId"]
const isContentEqual = (a: DailyActivityItem, b: DailyActivityItem) =>
  compareFields.every(key => a[key] === b[key])
