import { createClerkClient } from "@clerk/react-router/api.server"
import { getAuth, type ExternalAccount, type User } from "@clerk/react-router/ssr.server"
import { useEffect, useState } from "react"
import { redirect, useFetcher, useSearchParams } from "react-router"
import { tv } from "tailwind-variants"

import type { Route } from "./+types/user"

import { Icon } from "~/components/ui/Icon"
import type { ActivityType } from "~/db/schema"
import { userActivity } from "~/lib/query/activity"
import { updateProfile } from "~/lib/query/admin"
import { getProfile } from "~/lib/query/profile"
import { grade as gradeOptions, timeForNextGrade } from "~/lib/utils"
import { Role } from "~/lib/zod"
import { style } from "~/styles/component"
import type { Profile } from "~/type"

// MARK: Loader
export async function loader({ context, params, request }: Route.LoaderArgs) {
  const clerkClient = createClerkClient({
    secretKey: context.cloudflare.env.CLERK_SECRET_KEY,
  })

  const { userId } = params
  if (!userId) {
    throw new Response("User ID is required", { status: 400 })
  }

  try {
    const user = await clerkClient.users.getUser(userId)
    const profile = await getProfile({ userId, env: context.cloudflare.env })

    if (!profile) {
      throw new Response("Profile not found", { status: 404 })
    }

    // URL parameters for filtering
    const url = new URL(request.url)
    const startParam = url.searchParams.get("start")
    const endParam = url.searchParams.get("end")

    // If reset parameter exists, redirect to clear query params
    if (url.searchParams.get("reset")) {
      return new Response(null, {
        status: 302,
        headers: { Location: url.pathname },
      })
    }

    // Validate and parse date parameters
    let startValue: Date | undefined
    let endValue: Date | undefined

    if (startParam) {
      startValue = new Date(startParam)
      if (isNaN(startValue.getTime())) {
        throw new Response("Invalid start date format", { status: 400 })
      }
    }

    if (endParam) {
      endValue = new Date(endParam)
      if (isNaN(endValue.getTime())) {
        throw new Response("Invalid end date format", { status: 400 })
      }
    }

    // ページング用クエリ取得
    const pageParam = url.searchParams.get("page")
    const page = Math.max(Number(pageParam) || 1, 1)
    const limit = 10 // デフォルト10件固定

    // Get user activities with date filtering
    const allActivities = (
      await userActivity({
        userId,
        start: startValue,
        end: endValue,
        env: context.cloudflare.env,
      })
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    const totalActivitiesCount = allActivities.length
    const activities = allActivities.slice((page - 1) * limit, page * limit)

    // Calculate training count from activities in filtered period
    const trainCount = Math.floor(
      activities.map(record => record.period).reduce((a, b) => a + b, 0) / 1.5,
    )

    // Calculate total training count (all activities)
    const totalActivities = await userActivity({
      userId,
      start: undefined,
      end: undefined,
      env: context.cloudflare.env,
    })
    const totalTrains = Math.floor(
      totalActivities.map(record => record.period).reduce((a, b) => a + b, 0) / 1.5,
    )

    return {
      user,
      profile,
      activities,
      trainCount,
      totalTrains,
      startValue: startParam,
      endValue: endParam,
      page,
      totalActivitiesCount,
      limit,
    }
  } catch (error) {
    // Handle different types of errors appropriately
    if (error instanceof Response) {
      throw error
    }

    // Clerk user not found error
    if (error && typeof error === "object" && "status" in error && error.status === 404) {
      throw new Response("User not found", { status: 404 })
    }

    throw new Response("Internal server error", { status: 500 })
  }
}

// MARK: Meta
export function meta(args: Route.MetaArgs) {
  return [
    {
      title:
        `${args.data?.user.lastName} ` +
        `${args.data?.user.firstName} ` +
        "| ユーザー編集 - ハム大合気ポータル",
    },
    { name: "description", content: "合気道部員の詳細情報編集画面" },
  ]
}

// MARK: Action
export async function action(args: Route.ActionArgs) {
  const { userId } = await getAuth(args)
  if (!userId) {
    return redirect("/sign-in?redirect_url=" + args.request.url)
  }

  const formData = await args.request.formData()

  const year = formData.get("year")?.toString()
  const gradeStr = formData.get("grade")?.toString()
  const role = formData.get("role")?.toString()
  const joinedAtStr = formData.get("joinedAt")?.toString()
  const getGradeAtStr = formData.get("getGradeAt")?.toString()

  if (!year || !gradeStr || !role || !joinedAtStr) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "必須フィールドが入力されていません",
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    )
  }

  // Validate and parse numeric values
  const grade = Number(gradeStr)
  const joinedAt = Number(joinedAtStr)

  if (isNaN(grade) || isNaN(joinedAt)) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "級段位または入部年度の形式が正しくありません",
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    )
  }

  // Validate joined year range
  const currentYear = new Date().getFullYear()
  if (joinedAt < 1950 || joinedAt > currentYear + 1) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "入部年度が有効な範囲外です",
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    )
  }

  // Parse and validate grade date if provided
  let getGradeAt: Date | undefined
  if (getGradeAtStr) {
    getGradeAt = new Date(getGradeAtStr)
    if (isNaN(getGradeAt.getTime())) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "級段位取得日の形式が正しくありません",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      )
    }
  }

  const { params } = args
  const targetUserId = params.userId

  if (!targetUserId) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "ユーザーIDが必要です",
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    )
  }

  try {
    const result = await updateProfile({
      applicateBy: userId,
      newProfile: {
        id: targetUserId,
        year,
        grade,
        role,
        joinedAt,
        getGradeAt,
      },
      env: args.context.cloudflare.env,
    })

    if (result instanceof Error) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "プロフィールの更新に失敗しました",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    return redirect(`/admin/user/${targetUserId}`)
  } catch (err) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "サーバーエラーが発生しました" + `${err}`,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}

// MARK: Component
export default function AdminUser(args: Route.ComponentProps) {
  const {
    user,
    profile,
    activities,
    trainCount,
    totalTrains,
    startValue,
    endValue,
    page = 1,
    totalActivitiesCount = 0,
    limit = 10,
  } = args.loaderData
  const [showFilters, setShowFilters] = useState(false)
  const discord = user.externalAccounts?.find(acc => acc.provider === "oauth_discord")

  const fetcher = useFetcher()
  const [isEditing, setIsEditing] = useState(false)
  const [notification, setNotification] = useState<{
    type: "success" | "error"
    message: string
  } | null>(null)

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data) {
      try {
        const response = typeof fetcher.data === "string" ? JSON.parse(fetcher.data) : fetcher.data
        if (response?.error) {
          setNotification({ type: "error", message: response.error })
          const timer = setTimeout(() => setNotification(null), 5000)
          return () => clearTimeout(timer)
        } else {
        }
      } catch {
        if (fetcher.data instanceof Error) {
          setNotification({ type: "error", message: "エラーが発生しました" })
          const timer = setTimeout(() => setNotification(null), 5000)
          return () => clearTimeout(timer)
        }
      }
    }
    if (!fetcher.data && fetcher.state == "idle") setIsEditing(false)
  }, [fetcher.state, fetcher.data])

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <p className="text-lg text-slate-600 dark:text-slate-400">
            プロフィール情報が見つかりませんでした。
          </p>
          <a href="/admin" className={button({ variant: "primary", class: "mt-4" })}>
            アカウント管理に戻る
          </a>
        </div>
      </div>
    )
  }

  const FormWrapper = isEditing ? fetcher.Form : "form"

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <a href="/admin" className={button({ variant: "ghost" })}>
          ← アカウント管理に戻る
        </a>
      </div>

      {/* Notification */}
      {notification && (
        <div className={notificationStyle({ type: notification.type, className: "mb-6" })}>
          <div className="flex items-center justify-between">
            <span>{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="ml-4 text-current hover:opacity-70"
              aria-label="通知を閉じる"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* User Profile Section */}
      <UserProfileSection user={user as User} profile={profile} discord={discord} />

      <FormWrapper
        method="post"
        className={style.form.container({ class: "mb-4" })}
        encType={isEditing ? "multipart/form-data" : undefined}
        onSubmit={e => {
          if (isEditing) {
            // Client-side validation
            const form = e.target as HTMLFormElement
            const formData = new FormData(form)

            const joinedAt = Number(formData.get("joinedAt"))
            const currentYear = new Date().getFullYear()

            if (joinedAt < 1950 || joinedAt > currentYear + 1) {
              e.preventDefault()
              setNotification({
                type: "error",
                message: `入部年度は1950年から${currentYear + 1}年の間で入力してください`,
              })
              return
            }

            const getGradeAtStr = formData.get("getGradeAt")?.toString()
            if (getGradeAtStr) {
              const getGradeAt = new Date(getGradeAtStr)
              if (isNaN(getGradeAt.getTime())) {
                e.preventDefault()
                setNotification({
                  type: "error",
                  message: "級段位取得日の形式が正しくありません",
                })
                return
              }
            }
          }
        }}
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <RoleSelect profile={profile} isEditing={isEditing} fetcherState={fetcher.state} />
          </div>
          <GradeSelect profile={profile} isEditing={isEditing} fetcherState={fetcher.state} />
          <GetGradeAtInput profile={profile} isEditing={isEditing} fetcherState={fetcher.state} />
          <JoinedAtInput profile={profile} isEditing={isEditing} fetcherState={fetcher.state} />
          <YearSelect profile={profile} isEditing={isEditing} fetcherState={fetcher.state} />
        </div>

        <div className="flex gap-2">
          {isEditing ? (
            <>
              <button
                type="submit"
                className={style.form.button({
                  disabled: fetcher.state !== "idle",
                  type: "green",
                })}
                disabled={fetcher.state !== "idle"}
              >
                {fetcher.state !== "idle" ? "通信中" : "保存"}
              </button>
              <button
                type="button"
                className={style.form.button({
                  disabled: fetcher.state !== "idle",
                  type: "gray",
                })}
                disabled={fetcher.state !== "idle"}
                onClick={() => setIsEditing(false)}
              >
                キャンセル
              </button>
            </>
          ) : (
            <button
              type="button"
              className={style.form.button()}
              onClick={() => setIsEditing(true)}
            >
              編集
            </button>
          )}
        </div>
      </FormWrapper>

      {/* Stats Section */}
      <StatsSection trainCount={trainCount} totalTrains={totalTrains} grade={profile.grade} />

      {/* Filter Section */}
      <FilterSection
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        startValue={startValue ?? ""}
        endValue={endValue ?? ""}
      />

      {/* Activities Table */}
      <ActivitiesTable
        activities={activities}
        page={page}
        total={totalActivitiesCount}
        limit={limit}
      />
    </>
  )
}

// MARK: UI
// Clerkのuser型はany相当でpropsを通す
interface UserProfileSectionProps {
  user: User
  profile: Profile
  discord?: ExternalAccount
}
function UserProfileSection({ user, profile, discord }: UserProfileSectionProps) {
  return (
    <div className={card({ className: "p-6 mb-6" })}>
      <div className="flex items-center gap-4 mb-6">
        <img
          src={user.imageUrl}
          alt={`${user.lastName ?? ""} ${user.firstName ?? ""}`}
          className="w-16 h-16 rounded-full object-cover border-4 border-slate-200 dark:border-slate-600"
        />
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            {user.lastName ?? ""} {user.firstName ?? ""}
          </h2>
          {discord && discord.username && (
            <p className="text-slate-600 dark:text-slate-400 flex flex-row items-center text-sm">
              <Icon icon="discord-logo" className="!m-0 !mr-2" />
              {discord.username}
            </p>
          )}
          <p className="text-slate-600 dark:text-slate-400 flex flex-row items-center text-sm">
            <Icon icon="envelope" className="!m-0 !mr-2" />
            {user.emailAddresses[0]?.emailAddress || "未設定"}
          </p>
        </div>
      </div>
      <div>
        <div className="space-y-3 flex flex-col">
          <div className={info().frame()}>
            <label className={info().label()}>役職</label>
            <p className={info().value()}>{Role.fromString(profile.role)?.ja || "部員"}</p>
          </div>
          <div className={info().frame()}>
            <label className={info().label()}>作成日</label>
            <p className={info().value()}>
              {user.createdAt ? new Date(user.createdAt).toLocaleString("ja-JP") : "-"}
            </p>
          </div>
          <div className={info().frame()}>
            <label className={info().label()}>最終更新日</label>
            <p className={info().value()}>
              {user.updatedAt ? new Date(user.updatedAt).toLocaleString("ja-JP") : "-"}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

interface StatsSectionProps {
  trainCount: number
  totalTrains: number
  grade: number
}
function StatsSection({ trainCount, totalTrains, grade }: StatsSectionProps) {
  return (
    <div className={statsCard({ className: "mb-6" })}>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">次の級段位まで</p>
          <p className="text-lg font-bold text-yellow-900 dark:text-yellow-100">
            {trainCount}/{timeForNextGrade(grade)}回
          </p>
        </div>
        <div>
          <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">累計稽古回数</p>
          <p className="text-lg font-bold text-purple-900 dark:text-purple-100">{totalTrains}回</p>
        </div>
      </div>
    </div>
  )
}

interface FilterSectionProps {
  showFilters: boolean
  setShowFilters: (v: boolean) => void
  startValue: string
  endValue: string
}
function FilterSection({ showFilters, setShowFilters, startValue, endValue }: FilterSectionProps) {
  return (
    <div className={filterCard({ className: "mb-6" })}>
      <div>
        <button onClick={() => setShowFilters(!showFilters)} className={filterButton()}>
          <span className="text-lg font-medium text-slate-900 dark:text-slate-50">フィルター</span>
        </button>
        {showFilters && (
          <div className="p-6">
            <form id="filter-form" method="GET" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="start" className={style.text.info()}>
                    開始日
                  </label>
                  <input
                    type="date"
                    id="start"
                    name="start"
                    defaultValue={startValue || ""}
                    className={input()}
                  />
                </div>
                <div>
                  <label htmlFor="end" className={style.text.info()}>
                    終了日
                  </label>
                  <input
                    type="date"
                    id="end"
                    name="end"
                    defaultValue={endValue || ""}
                    className={input()}
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  name="reset"
                  value="true"
                  className={style.button({ type: "secondary" })}
                >
                  リセット
                </button>
                <button type="submit" className={style.button()}>
                  フィルター
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

interface ActivitiesTableProps {
  activities: ActivityType[]
  page: number
  total: number
  limit: number
}
function ActivitiesTable({ activities, page, total, limit }: ActivitiesTableProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit))
  const [params] = useSearchParams()
  const makePageUrl = (p: number) => {
    if (p > 1) {
      params.set("page", String(p))
    } else {
      params.delete("page")
    }
    // ページング時にアンカーを付与
    return "?" + params.toString() + "#activities"
  }

  return (
    <div className={filterCard()} id="activities">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-200 dark:bg-slate-700">
            <tr>
              <th className={tablehead()}>日付</th>
              <th className={tablehead()}>稽古時間</th>
              <th className={tablehead()}>編集日</th>
            </tr>
          </thead>
          <tbody className="bg-slate-50 dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
            {activities.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  className="px-6 py-8 text-center text-slate-500 dark:text-slate-400"
                >
                  履歴はありません
                </td>
              </tr>
            ) : (
              activities.map(activity => (
                <tr key={activity.id} className={tableRow()}>
                  <td className={tableCell({ variant: "primary" })}>
                    {new Date(activity.date).toLocaleDateString("ja-JP")}
                  </td>
                  <td className={tableCell({ variant: "primary" })}>{activity.period}時間</td>
                  <td className={tableCell({ variant: "secondary" })}>
                    {activity.updatedAt
                      ? new Date(activity.updatedAt).toLocaleString("ja-JP")
                      : "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* ページングUI */}
      {totalPages > 1 && (
        <nav className="flex justify-center gap-2 py-4" aria-label="ページネーション">
          <a
            href={makePageUrl(page - 1)}
            className={`px-3 py-1 rounded ${page <= 1 ? "pointer-events-none opacity-50" : "bg-slate-200 hover:bg-slate-300"}`}
            aria-disabled={page <= 1}
            tabIndex={page <= 1 ? -1 : 0}
          >
            前へ
          </a>
          {Array.from({ length: totalPages }).map((_, i) => {
            const p = i + 1
            return (
              <a
                key={p}
                href={makePageUrl(p)}
                className={`px-3 py-1 rounded ${p === page ? "bg-blue-600 text-white" : "bg-slate-200 hover:bg-slate-300"}`}
                aria-current={p === page ? "page" : undefined}
              >
                {p}
              </a>
            )
          })}
          <a
            href={makePageUrl(page + 1)}
            className={`px-3 py-1 rounded ${page >= totalPages ? "pointer-events-none opacity-50" : "bg-slate-200 hover:bg-slate-300"}`}
            aria-disabled={page >= totalPages}
            tabIndex={page >= totalPages ? -1 : 0}
          >
            次へ
          </a>
        </nav>
      )}
    </div>
  )
}

function RoleSelect({ profile, isEditing, fetcherState }: FormFieldProps) {
  const disabled = !isEditing || fetcherState === "loading"
  return (
    <div>
      <label htmlFor="role" className={style.form.label({ necessary: true })}>
        役職
      </label>
      <select
        id="role"
        name="role"
        required
        className={style.form.select({ disabled })}
        defaultValue={profile.role}
        disabled={disabled}
      >
        {Role.ALL.map(r => (
          <option key={r.role} value={r.role}>
            {r.ja}
          </option>
        ))}
      </select>
    </div>
  )
}

function GradeSelect({ profile, isEditing, fetcherState }: FormFieldProps) {
  const disabled = !isEditing || fetcherState === "loading"
  return (
    <div>
      <label htmlFor="grade" className={style.form.label({ necessary: true })}>
        所持級段位
      </label>
      <select
        id="grade"
        name="grade"
        required
        className={style.form.select({ disabled })}
        defaultValue={profile.grade}
        disabled={disabled}
      >
        {gradeOptions.map(g => (
          <option key={g.grade} value={g.grade}>
            {g.name}
          </option>
        ))}
      </select>
    </div>
  )
}

function GetGradeAtInput({ profile, isEditing, fetcherState }: FormFieldProps) {
  const disabled = !isEditing || fetcherState === "loading"
  const value = profile.getGradeAt ? new Date(profile.getGradeAt).toISOString().split("T")[0] : ""
  return (
    <div>
      <label htmlFor="getGradeAt" className={style.form.label()}>
        級段位取得日
      </label>
      <input
        type="date"
        id="getGradeAt"
        name="getGradeAt"
        className={style.form.input({ disabled })}
        defaultValue={isEditing ? value : undefined}
        value={!isEditing ? value : undefined}
        disabled={disabled}
      />
    </div>
  )
}

function JoinedAtInput({ profile, isEditing, fetcherState }: FormFieldProps) {
  const disabled = !isEditing || fetcherState === "loading"
  const currentYear = new Date().getFullYear()
  return (
    <div>
      <label htmlFor="joinedAt" className={style.form.label({ necessary: true })}>
        入部年度
      </label>
      <input
        type="number"
        id="joinedAt"
        name="joinedAt"
        placeholder="4桁の数字"
        required
        min="1950"
        max={currentYear + 1}
        className={style.form.input({ disabled })}
        defaultValue={isEditing ? profile.joinedAt : undefined}
        value={!isEditing ? profile.joinedAt : undefined}
        disabled={disabled}
      />
    </div>
  )
}

function YearSelect({ profile, isEditing, fetcherState }: FormFieldProps) {
  const disabled = !isEditing || fetcherState === "loading"
  return (
    <div>
      <label htmlFor="year" className={style.form.label({ necessary: true })}>
        学年
      </label>
      <select
        id="year"
        name="year"
        required
        className={style.form.select({ disabled })}
        defaultValue={profile.year}
        disabled={disabled}
      >
        <option value="b1">学部 1年</option>
        <option value="b2">学部 2年</option>
        <option value="b3">学部 3年</option>
        <option value="b4">学部 4年</option>
        <option value="m1">修士 1年</option>
        <option value="m2">修士 2年</option>
        <option value="d1">博士 1年</option>
        <option value="d2">博士 2年</option>
      </select>
    </div>
  )
}

// MARK: Helper
const info = tv({
  slots: {
    frame: "flex flex-row",
    label: "block text-sm font-medium text-slate-700 dark:text-slate-300",
    value: "ml-auto items-end justify-center text-sm text-slate-900 dark:text-slate-100 font-mono",
  },
})

const tablehead = tv({
  base: "px-2 py-3 text-center text-xs font-medium text-slate-500 dark:text-slate-300 bg-slate-200 dark:bg-slate-800/90 uppercase tracking-wider",
})

const card = tv({
  base: "bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700",
})

const button = tv({
  base: "px-4 py-2 font-medium rounded-md transition-colors duration-200 focus:ring-2 focus:ring-offset-2",
  variants: {
    variant: {
      primary: "bg-blue-600 hover:bg-blue-700 text-slate-50 focus:ring-blue-500",
      secondary: "bg-slate-500 hover:bg-slate-600 text-slate-50 focus:ring-slate-500",
      ghost: "text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300",
    },
  },
})

const input = tv({
  base: "w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent",
})

const tableRow = tv({
  base: "hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors duration-150",
})

const tableCell = tv({
  base: "px-2 py-4 whitespace-nowrap text-sm text-center",
  variants: {
    variant: {
      primary: "text-slate-900 dark:text-slate-100",
      secondary: "text-slate-500 dark:text-slate-400",
    },
  },
})

const statsCard = tv({
  base: "rounded-md bg-slate-100 dark:bg-slate-800/50 p-6 shadow-md",
})

const filterCard = tv({
  base: "bg-slate-50 dark:bg-slate-800 rounded-lg shadow-md overflow-hidden",
})

const filterButton = tv({
  base: "w-full cursor-pointer p-4 bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors duration-200 text-left",
})

const notificationStyle = tv({
  base: "p-4 rounded-md border transition-all duration-300",
  variants: {
    type: {
      success:
        "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200",
      error:
        "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200",
    },
  },
})

// MARK: Form Components
interface FormFieldProps {
  profile: Profile
  isEditing: boolean
  fetcherState: string
}
