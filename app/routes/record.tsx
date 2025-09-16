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

import type { Route } from "./+types/record"

import DailyActivity from "~/components/component/DailyActivity"
import MonthlyActivityList from "~/components/component/MonthlyActivityList"
import MonthlyCalendarGrid from "~/components/component/MonthlyCalendarGrid"
import MonthNavigation from "~/components/component/MonthNavigation"
import YearMonthSelectorInline from "~/components/component/YearMonthSelector"
import { Button } from "~/components/ui/button"
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
    initialActivities?.map(act => ({ ...act, status: "unchanged" })) || [],
  )
  const [currentActivities, setActivities] = useState<DailyActivityItem[]>(
    initialActivities?.map(act => ({ ...act, status: "unchanged" })) || [],
  )

  useEffect(() => {
    setOriginalActivities(
      initialActivities?.map(act => ({ ...act, status: "unchanged" })) || [],
    )
    setActivities(initialActivities?.map(act => ({ ...act, status: "unchanged" })) || [])
  }, [initialActivities])

  useEffect(() => {
    if (fetcher.data && fetcher.data.updatedActivitiesWithStatus) {
      setActivities(fetcher.data.updatedActivitiesWithStatus)
      setOriginalActivities(fetcher.data.updatedActivitiesWithStatus)
    }
  }, [fetcher.data])

  const error = loaderError || actionData?.error || null
  const [showDailyActivityModal, setShowDailyActivityModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  // 新しいフックを呼び出す
  const { currentMonth, handleSelectYearMonth, daysInMonth } =
    useMonthlyNavigation(loadedMonth)

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
          onSelect={handleSelectYearMonth}
          YearMonthSelector={YearMonthSelectorInline}
        />
        <div className="overflow-x-auto w-full sm:block hidden">
          <fetcher.Form method="post">
            <div className="flex flex-row items-center justify-between mb-4">
              <div className="pr-1 w-3/4">
                <Button
                  type="submit"
                  className="w-full text-white bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
                  disabled={!isChanged || fetcher.state !== "idle"}
                  data-testid="record-button-submit"
                >
                  {fetcher.state === "idle"
                    ? "登録"
                    : fetcher.state === "loading"
                      ? "読み込み中"
                      : "送信中"}
                </Button>
              </div>
              <div className="pl-1 w-1/4">
                <Button
                  type="button"
                  className="w-full"
                  variant="destructive"
                  onClick={() => {
                    if (window.confirm("変更をリセットします。よろしいですか？")) {
                      setActivities(originalActivities)
                      setSelectedDate(null)
                      setShowDailyActivityModal(false)
                    }
                  }}
                  disabled={!isChanged || fetcher.state !== "idle"}
                  data-testid="record-button-reset"
                >
                  リセット
                </Button>
              </div>
            </div>
            <input type="hidden" name="actionType" value="batchUpdate" />
            <input
              type="hidden"
              name="currentMonth"
              value={format(currentMonth, "yyyy-MM")}
            />
            {(() => {
              const payload = prepareBatchUpdatePayload(
                userId,
                originalActivities,
                currentActivities,
              )
              return (
                <input
                  type="hidden"
                  name="payload"
                  value={JSON.stringify({
                    added: payload?.added || [],
                    updated: payload?.updated || [],
                    deleted: payload?.deleted || [],
                  })}
                />
              )
            })()}
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
            {(() => {
              const payload = prepareBatchUpdatePayload(
                userId,
                originalActivities,
                currentActivities,
              )
              return (
                <input
                  type="hidden"
                  name="payload"
                  value={JSON.stringify({
                    added: payload?.added || [],
                    updated: payload?.updated || [],
                    deleted: payload?.deleted || [],
                  })}
                />
              )
            })()}
            <div className="fixed w-full right-0 bottom-0">
              <div className="flex flex-row items-center justify-between pb-5 px-3">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => {
                    if (window.confirm("変更をリセットします。よろしいですか？")) {
                      setActivities(originalActivities)
                      setSelectedDate(null)
                      setShowDailyActivityModal(false)
                    }
                  }}
                  className="w-1/3 mx-1 my-4"
                  disabled={!isChanged || fetcher.state !== "idle"}
                  data-testid="record-button-reset-mobile"
                >
                  リセット
                </Button>
                <Button
                  type="submit"
                  className="w-full mx-1 my-4"
                  disabled={!isChanged || fetcher.state !== "idle"}
                  data-testid="record-button-submit-mobile"
                >
                  {fetcher.state === "idle"
                    ? "登録"
                    : fetcher.state === "loading"
                      ? "読み込み中"
                      : "送信中"}
                </Button>
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

  const activitiesToAdd: DailyActivityItem[] = []
  const activitiesToUpdate: DailyActivityItem[] = []
  const activitiesToDelete: string[] = []
  const updatedActivitiesWithStatus: DailyActivityItem[] = []

  // originalActivities にのみ存在するものは deleted
  originalActivities.forEach(originalAct => {
    const currentAct = currentActivities.find(
      ca => String(ca.id) === String(originalAct.id) && !ca.isDeleted,
    )
    if (!currentAct) {
      // currentActivities に存在しない、または isDeleted が true の場合は削除
      activitiesToDelete.push(originalAct.id!)
      updatedActivitiesWithStatus.push({
        ...originalAct,
        status: "deleted",
        isDeleted: true,
      })
    }
  })

  currentActivities.forEach(currentAct => {
    const originalAct = originalActivities.find(
      oa => String(oa.id) === String(currentAct.id),
    )

    if (currentAct.isDeleted) {
      // UI で isDeleted が true に設定されたものは削除対象
      if (originalAct && !activitiesToDelete.includes(originalAct.id!)) {
        activitiesToDelete.push(originalAct.id!)
        updatedActivitiesWithStatus.push({
          ...originalAct,
          status: "deleted",
          isDeleted: true,
        })
      } else if (!originalAct) {
        // 新規追加されたものがすぐに削除された場合は、追加も更新も不要
        return
      }
    } else if (originalAct) {
      // 既存の活動が更新されたかチェック
      const fieldsToCompare: (keyof DailyActivityItem)[] = ["date", "period", "userId"]
      const hasChanges = fieldsToCompare.some(
        field => originalAct[field] !== currentAct[field],
      )
      if (hasChanges) {
        activitiesToUpdate.push({ ...currentAct, id: originalAct.id })
        updatedActivitiesWithStatus.push({ ...currentAct, status: "updated" })
      } else {
        updatedActivitiesWithStatus.push({ ...currentAct, status: "unchanged" })
      }
    } else {
      // 新規追加
      activitiesToAdd.push(currentAct)
      updatedActivitiesWithStatus.push({ ...currentAct, status: "added" })
    }
  })

  // activitiesToDelete に含まれない originalActivities の要素を追加
  originalActivities.forEach(originalAct => {
    if (
      !activitiesToDelete.includes(originalAct.id!) &&
      !updatedActivitiesWithStatus.some(ua => String(ua.id) === String(originalAct.id))
    ) {
      updatedActivitiesWithStatus.push({ ...originalAct, status: "unchanged" })
    }
  })

  // updatedActivitiesWithStatus 内で重複するエントリを削除し、最新のステータスを優先
  const finalUpdatedActivitiesWithStatusMap = new Map<string, DailyActivityItem>()
  updatedActivitiesWithStatus.forEach(activity => {
    if (activity.id) {
      finalUpdatedActivitiesWithStatusMap.set(String(activity.id), activity)
    } else {
      // IDがない場合は、そのまま追加（新規追加アクティビティ）
      finalUpdatedActivitiesWithStatusMap.set(
        Date.now().toString() + Math.random().toString(),
        activity,
      ) // ユニークなキーを生成
    }
  })

  return {
    userId,
    added: activitiesToAdd,
    updated: activitiesToUpdate,
    deleted: activitiesToDelete,
    updatedActivitiesWithStatus: Array.from(finalUpdatedActivitiesWithStatusMap.values()),
  }
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
