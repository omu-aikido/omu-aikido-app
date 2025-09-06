import { createClerkClient } from "@clerk/react-router/api.server"
import { getAuth, type User } from "@clerk/react-router/ssr.server"
import { useEffect, useState } from "react"
import { Link, redirect, useFetcher } from "react-router"
import { toast } from "sonner"

import type { Route } from "./+types/user"

import { StatsSection } from "~/components/component/AccountStatus"
import { ActivitiesTable } from "~/components/component/UserActivitiesTable"
import { UserProfileSection } from "~/components/component/UserProfile"
import { FilterSection } from "~/components/component/UserRecordsFilter"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { StateButton } from "~/components/ui/StateButton"
import { activitySummary } from "~/lib/query/activity"
import { updateProfile } from "~/lib/query/admin"
import { getProfile } from "~/lib/query/profile"
import { getJST, grade as gradeOptions } from "~/lib/utils"
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
  const user = await clerkClient.users.getUser(userId)
  const profile = await getProfile({ userId, env: context.cloudflare.env })

  // fitler
  const url = new URL(request.url)
  const startParam = url.searchParams.get("start")
  const endParam = url.searchParams.get("end")
  // If reset parameter exists, redirect to clear query params
  if (url.searchParams.get("reset")) return redirect(url.pathname)

  try {
    let startValue: Date | undefined
    let endValue: Date | undefined

    if (startParam) {
      startValue = getJST(new Date(startParam))
      if (isNaN(startValue.getTime())) {
        throw new Response("Invalid start date format", { status: 400 })
      }
    }

    if (endParam) {
      endValue = getJST(new Date(endParam))
      if (isNaN(endValue.getTime())) {
        throw new Response("Invalid end date format", { status: 400 })
      }
    }

    // ページング用クエリ取得
    const pageParam = url.searchParams.get("page")
    const page = Math.max(Number(pageParam) || 1, 1)
    const limit = 10

    const getGradeAt = new Date(
      profile?.getGradeAt ?? (profile?.joinedAt ?? new Date().getFullYear(), 3, 1),
    )

    // Get user activities with date filtering
    const { all, total, done } = await activitySummary({
      userId,
      getGradeAt,
      env: context.cloudflare.env,
    })

    const totalActivitiesCount = all.length
    const activities = all.slice((page - 1) * limit, page * limit)

    // 総稽古日数（ユニーク日付数）
    const uniqueDates = new Set(all.map(a => new Date(a.date).toDateString()))
    const totalDays = uniqueDates.size
    // 総稽古回数（エントリー数）
    const totalEntries = all.length
    // 総稽古時間
    const totalHours = all.reduce((sum, a) => sum + (a.period || 0), 0)

    return {
      user,
      profile,
      activities,
      trainCount: total,
      doneTrain: done,
      startValue: startParam,
      endValue: endParam,
      page,
      totalActivitiesCount,
      limit,
      totalDays,
      totalEntries,
      totalHours,
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

    // それ以外のエラーは最低限のデータで返す
    return {
      user: null,
      profile: null,
      activities: [],
      trainCount: 0,
      doneTrain: 0,
      startValue: undefined,
      endValue: undefined,
      page: 1,
      totalActivitiesCount: 0,
      limit: 10,
    }
  }
}

// MARK: Meta
export function meta(args: Route.MetaArgs) {
  const user = args.data?.user
  return [
    {
      title:
        `${user?.lastName ?? ""} ` +
        `${user?.firstName ?? ""} ` +
        "| ユーザー編集 - ハム大合気ポータル",
    },
    { name: "description", content: "合気道部員の詳細情報編集画面" },
  ]
}

// MARK: Action
export async function action(args: Route.ActionArgs) {
  const { userId } = await getAuth(args)
  if (!userId) {
    return new Response(JSON.stringify({ success: false, error: "認証されていません" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    })
  }

  const formData = await args.request.formData()

  const year = formData.get("year")?.toString()
  const gradeStr = formData.get("grade")?.toString()
  const role = formData.get("role")?.toString()
  const joinedAtStr = formData.get("joinedAt")?.toString()
  const getGradeAtStr = formData.get("getGradeAt")?.toString()

  if (!year || !gradeStr || !role || !joinedAtStr) {
    return new Response(
      JSON.stringify({ success: false, error: "必須フィールドが入力されていません" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
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
      { status: 400, headers: { "Content-Type": "application/json" } },
    )
  }

  // Validate joined year range
  const currentYear = new Date().getFullYear()
  if (joinedAt < 1950 || joinedAt > currentYear + 1) {
    return new Response(
      JSON.stringify({ success: false, error: "入部年度が有効な範囲外です" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    )
  }

  // Parse and validate grade date if provided
  let getGradeAt: Date | undefined
  if (getGradeAtStr) {
    getGradeAt = new Date(getGradeAtStr)
    if (isNaN(getGradeAt.getTime())) {
      return new Response(
        JSON.stringify({ success: false, error: "級段位取得日の形式が正しくありません" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      )
    }
  }

  const { params } = args
  const targetUserId = params.userId

  if (!targetUserId) {
    return new Response(
      JSON.stringify({ success: false, error: "ユーザーIDが必要です" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    )
  }

  try {
    const result = await updateProfile({
      applicateBy: userId,
      newProfile: { id: targetUserId, year, grade, role, joinedAt, getGradeAt },
      env: args.context.cloudflare.env,
    })

    if (result instanceof Error) {
      return new Response(
        JSON.stringify({ success: false, error: "プロフィールの更新に失敗しました" }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      )
    }

    return redirect(`/admin/user/${targetUserId}`)
  } catch (err) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "サーバーエラーが発生しました" + `${err}`,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
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
    doneTrain,
    startValue,
    endValue,
    page = 1,
    totalActivitiesCount = 0,
    limit = 10,
    totalDays = 0,
    totalEntries = 0,
    totalHours = 0,
  } = args.loaderData
  const discord = Array.isArray(user?.externalAccounts)
    ? user.externalAccounts.find(
        (acc: { provider: string }) => acc.provider === "oauth_discord",
      )
    : undefined

  const fetcher = useFetcher()
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data) {
      try {
        const response =
          typeof fetcher.data === "string" ? JSON.parse(fetcher.data) : fetcher.data
        if (response?.error) {
          toast.error(response.error)
        }
      } catch {
        if (fetcher.data instanceof Error) {
          toast.error("エラーが発生しました")
        }
      }
    }
    if (!fetcher.data && fetcher.state == "idle") setIsEditing(false)
  }, [fetcher.state, fetcher.data])

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <p className="text-lg text-slate-600 dark:text-slate-400">
            ユーザー情報が見つかりませんでした。
          </p>
          <Button asChild className="mt-4">
            <Link to="/admin">アカウント管理に戻る</Link>
          </Button>
        </div>
      </div>
    )
  }

  // profileがnullでもフォームを表示できるように初期値を用意
  const safeProfile = profile ?? {
    role: "member",
    grade: 0,
    getGradeAt: "",
    joinedAt: new Date().getFullYear(),
    year: "b1",
    id: user.id,
  }

  const FormWrapper = isEditing ? fetcher.Form : "form"

  return (
    <>

      {/* User Profile Section */}
      <UserProfileSection
        user={user as User}
        unSafeprofile={profile}
        profile={safeProfile}
        discord={discord}
      />
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
              toast.error(
                `入部年度は1950年から${currentYear + 1}年の間で入力してください`,
              )
              return
            }

            const getGradeAtStr = formData.get("getGradeAt")?.toString()
            if (getGradeAtStr) {
              const getGradeAt = new Date(getGradeAtStr)
              if (isNaN(getGradeAt.getTime())) {
                e.preventDefault()
                toast.error("級段位取得日の形式が正しくありません")
                return
              }
            }
          }
        }}
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <RoleSelect
              profile={safeProfile}
              isEditing={isEditing}
              fetcherState={fetcher.state}
            />
          </div>
          <GradeSelect
            profile={safeProfile}
            isEditing={isEditing}
            fetcherState={fetcher.state}
          />
          <GetGradeAtInput
            profile={safeProfile}
            isEditing={isEditing}
            fetcherState={fetcher.state}
          />
          <JoinedAtInput
            profile={safeProfile}
            isEditing={isEditing}
            fetcherState={fetcher.state}
          />
          <YearSelect
            profile={safeProfile}
            isEditing={isEditing}
            fetcherState={fetcher.state}
          />
        </div>
        <StateButton
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          fetcher={fetcher}
        />
      </FormWrapper>
      {/* Stats Section */}
      <StatsSection
        totalTrainCount={trainCount}
        currentGradeTrainCount={doneTrain}
        grade={safeProfile.grade}
        totalDays={totalDays}
        totalEntries={totalEntries}
        totalHours={totalHours}
      />
      {/* Filter Section */}
      <FilterSection startValue={startValue ?? ""} endValue={endValue ?? ""} />
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

function RoleSelect({ profile, isEditing, fetcherState }: FormFieldProps) {
  const disabled = !isEditing || fetcherState === "loading"
  return (
    <div className="space-y-2">
      <Label htmlFor="role">
        役職<span className="text-red-500">*</span>
      </Label>
      <Select
        name="role"
        required
        defaultValue={profile.role}
        disabled={disabled}
      >
        <SelectTrigger id="role">
          <SelectValue placeholder="役職を選択" />
        </SelectTrigger>
        <SelectContent>
          {Role.ALL.map(r => (
            <SelectItem key={r.role} value={r.role}>
              {r.ja}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

function GradeSelect({ profile, isEditing, fetcherState }: FormFieldProps) {
  const disabled = !isEditing || fetcherState === "loading"
  return (
    <div className="space-y-2">
      <Label htmlFor="grade">
        所持級段位<span className="text-red-500">*</span>
      </Label>
      <Select
        name="grade"
        required
        defaultValue={String(profile.grade)}
        disabled={disabled}
      >
        <SelectTrigger id="grade">
          <SelectValue placeholder="級段位を選択" />
        </SelectTrigger>
        <SelectContent>
          {gradeOptions.map(g => (
            <SelectItem key={g.grade} value={String(g.grade)}>
              {g.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

function GetGradeAtInput({ profile, isEditing, fetcherState }: FormFieldProps) {
  const disabled = !isEditing || fetcherState === "loading"
  const value = profile.getGradeAt
    ? new Date(profile.getGradeAt).toISOString().split("T")[0]
    : ""
  return (
    <div className="space-y-2">
      <Label htmlFor="getGradeAt">級段位取得日</Label>
      <Input
        type="date"
        id="getGradeAt"
        name="getGradeAt"
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
    <div className="space-y-2">
      <Label htmlFor="joinedAt">
        入部年度<span className="text-red-500">*</span>
      </Label>
      <Input
        type="number"
        id="joinedAt"
        name="joinedAt"
        placeholder="4桁の数字"
        required
        min="1950"
        max={currentYear + 1}
        defaultValue={isEditing ? profile.joinedAt : undefined}
        value={!isEditing ? profile.joinedAt : undefined}
        disabled={disabled}
      />
    </div>
  )
}

function YearSelect({ profile, isEditing, fetcherState }: FormFieldProps) {
  const disabled = !isEditing || fetcherState === "loading"
  const yearOptions = [
    { value: "b1", label: "学部 1年" },
    { value: "b2", label: "学部 2年" },
    { value: "b3", label: "学部 3年" },
    { value: "b4", label: "学部 4年" },
    { value: "m1", label: "修士 1年" },
    { value: "m2", label: "修士 2年" },
    { value: "d1", label: "博士 1年" },
    { value: "d2", label: "博士 2年" },
  ]
  return (
    <div className="space-y-2">
      <Label htmlFor="year">
        学年<span className="text-red-500">*</span>
      </Label>
      <Select
        name="year"
        required
        defaultValue={profile.year}
        disabled={disabled}
      >
        <SelectTrigger>
          <SelectValue placeholder="学年を選択" />
        </SelectTrigger>
        <SelectContent>
          {yearOptions.map(y => (
            <SelectItem key={y.value} value={y.value}>
              {y.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}



// MARK: Form Components
interface FormFieldProps {
  profile: Profile
  isEditing: boolean
  fetcherState: string
}
