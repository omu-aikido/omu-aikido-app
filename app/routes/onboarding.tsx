import { createClerkClient, getAuth } from "@clerk/react-router/server"
import { useEffect, useState, useMemo } from "react"
import { redirect, useFetcher, useNavigate } from "react-router"

import type { Route } from "./+types/onboarding"

import { Button } from "~/components/ui/button"
import { DatePicker } from "~/components/ui/date-picker"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { grade, JoinedAtYearRange, year } from "~/lib/utils"
import { style } from "~/styles/component"

// MARK: Loader
export async function loader(args: Route.LoaderArgs) {
  const auth = await getAuth(args)

  // 未認証の場合はサインアップページへ
  if (!auth.isAuthenticated || !auth.userId) {
    return redirect("/sign-up")
  }

  try {
    const clerkClient = createClerkClient({
      secretKey: args.context.cloudflare.env.CLERK_SECRET_KEY,
    })

    // ユーザー情報を取得
    const user = await clerkClient.users.getUser(auth.userId)

    // 既にpublicMetadataが設定済みの場合はホームへ
    if (
      user.publicMetadata &&
      typeof user.publicMetadata === "object" &&
      "role" in user.publicMetadata
    ) {
      return redirect("/")
    }

    // unsafeMetadataからプロファイル情報を取得
    const unsafeMetadata = user.unsafeMetadata as {
      year?: string
      grade?: number
      joinedAt?: number
      getGradeAt?: string | null
    }

    if (!unsafeMetadata || typeof unsafeMetadata !== "object") {
      return {
        hasError: false,
        needsProfileSetup: true,
        message: "プロファイル情報を設定してください。",
      }
    }

    // 値の型・範囲チェック
    const year = typeof unsafeMetadata.year === "string" ? unsafeMetadata.year : undefined
    const grade =
      typeof unsafeMetadata.grade === "number" ? unsafeMetadata.grade : undefined
    const joinedAt =
      typeof unsafeMetadata.joinedAt === "number" &&
      unsafeMetadata.joinedAt >= JoinedAtYearRange.min &&
      unsafeMetadata.joinedAt <= JoinedAtYearRange.max
        ? unsafeMetadata.joinedAt
        : undefined

    let getGradeAt: string | null = null
    if (
      unsafeMetadata.getGradeAt !== null &&
      typeof unsafeMetadata.getGradeAt === "string" &&
      unsafeMetadata.getGradeAt.trim() !== ""
    ) {
      const dateStr = unsafeMetadata.getGradeAt.trim()
      const date = new Date(dateStr)
      if (!isNaN(date.getTime())) {
        getGradeAt = date.toISOString().split("T")[0]
      }
    }

    if (!year || grade === undefined || joinedAt === undefined) {
      return {
        hasError: false,
        needsProfileSetup: true,
        message: "プロファイル情報を設定してください。",
      }
    }

    // プロファイルデータをpublicMetadataに移動（自動実行）
    const profileData = { year, grade, joinedAt, getGradeAt, role: "member" as const }

    // publicMetadataを更新し、unsafeMetadataをクリア
    await clerkClient.users.updateUserMetadata(auth.userId, {
      publicMetadata: profileData,
      unsafeMetadata: {},
    })

    // ホームページにリダイレクト
    return redirect("/")
  } catch {
    return {
      hasError: true,
      error: "アカウントの設定に失敗しました。しばらくしてから再度お試しください。",
      requiresReSignup: false,
    }
  }
}

// MARK: Meta
export function meta() {
  return [
    { title: "アカウント設定中 | ハム大合気ポータル" },
    { name: "description", content: "アカウントの初期設定を行っています" },
  ]
}

// MARK: Action
export async function action(args: Route.ActionArgs) {
  const auth = await getAuth(args)

  if (!auth.isAuthenticated || !auth.userId) {
    return Response.json({ success: false, error: "認証が必要です" }, { status: 401 })
  }

  const formData = await args.request.formData()
  const actionType = formData.get("actionType") as string

  if (actionType === "retry") {
    try {
      const clerkClient = createClerkClient({
        secretKey: args.context.cloudflare.env.CLERK_SECRET_KEY,
      })

      // ユーザー情報を取得
      const user = await clerkClient.users.getUser(auth.userId)

      // 既にpublicMetadataが設定済みの場合はホームへ
      if (
        user.publicMetadata &&
        typeof user.publicMetadata === "object" &&
        "role" in user.publicMetadata
      ) {
        return Response.json({ success: true, redirect: "/" })
      }

      // unsafeMetadataからプロファイル情報を取得
      const unsafeMetadata = user.unsafeMetadata as {
        year?: string
        grade?: number
        joinedAt?: number
        getGradeAt?: string | null
      }

      if (!unsafeMetadata || typeof unsafeMetadata !== "object") {
        return Response.json({
          success: false,
          error: "プロファイル情報が見つかりません。再度サインアップしてください。",
          requiresReSignup: true,
        })
      }

      // 値の型・範囲チェック
      const year =
        typeof unsafeMetadata.year === "string" ? unsafeMetadata.year : undefined
      const grade =
        typeof unsafeMetadata.grade === "number" ? unsafeMetadata.grade : undefined
      const joinedAt =
        typeof unsafeMetadata.joinedAt === "number" &&
        unsafeMetadata.joinedAt >= JoinedAtYearRange.min &&
        unsafeMetadata.joinedAt <= JoinedAtYearRange.max
          ? unsafeMetadata.joinedAt
          : undefined

      let getGradeAt: string | null = null
      if (
        unsafeMetadata.getGradeAt !== null &&
        typeof unsafeMetadata.getGradeAt === "string" &&
        unsafeMetadata.getGradeAt.trim() !== ""
      ) {
        const dateStr = unsafeMetadata.getGradeAt.trim()
        const date = new Date(dateStr)
        if (!isNaN(date.getTime())) {
          getGradeAt = date.toISOString().split("T")[0]
        }
      }

      if (!year || grade === undefined || joinedAt === undefined) {
        return Response.json({
          success: false,
          error: "プロファイル情報が不正です。再度サインアップしてください。",
          requiresReSignup: true,
        })
      }

      // プロファイルデータをpublicMetadataに移動
      const profileData = { year, grade, joinedAt, getGradeAt, role: "member" as const }

      // publicMetadataを更新し、unsafeMetadataをクリア
      await clerkClient.users.updateUserMetadata(auth.userId, {
        publicMetadata: profileData,
        unsafeMetadata: {},
      })

      return Response.json({ success: true, redirect: "/" })
    } catch {
      return Response.json({
        success: false,
        error: "アカウントの設定に失敗しました。しばらくしてから再度お試しください。",
      })
    }
  }

  if (actionType === "setupProfile") {
    try {
      const year = formData.get("year") as string
      const gradeStr = formData.get("grade") as string
      const joinedAtStr = formData.get("joinedAt") as string
      const getGradeAt = formData.get("getGradeAt") as string

      // バリデーション
      const errors: Record<string, string> = {}

      if (!year) {
        errors.year = "学年は必須です"
      }

      if (!gradeStr) {
        errors.grade = "級段位は必須です"
      }

      if (!joinedAtStr) {
        errors.joinedAt = "入部年度は必須です"
      } else {
        const joinedAtNum = parseInt(joinedAtStr)
        if (
          isNaN(joinedAtNum) ||
          joinedAtNum < JoinedAtYearRange.min ||
          joinedAtNum > JoinedAtYearRange.max
        ) {
          errors.joinedAt = `入部年度は${JoinedAtYearRange.min}年から${JoinedAtYearRange.max}年の間で入力してください`
        }
      }

      if (Object.keys(errors).length > 0) {
        return Response.json({ success: false, errors })
      }

      const grade = parseInt(gradeStr)
      const joinedAt = parseInt(joinedAtStr)

      let processedGetGradeAt: string | null = null
      if (getGradeAt && getGradeAt.trim() !== "") {
        const dateStr = getGradeAt.trim()
        const date = new Date(dateStr)
        if (!isNaN(date.getTime())) {
          processedGetGradeAt = date.toISOString().split("T")[0]
        }
      }

      const clerkClient = createClerkClient({
        secretKey: args.context.cloudflare.env.CLERK_SECRET_KEY,
      })

      // プロファイルデータをpublicMetadataに設定
      const profileData = {
        year,
        grade,
        joinedAt,
        getGradeAt: processedGetGradeAt,
        role: "member" as const,
      }

      // publicMetadataを更新
      await clerkClient.users.updateUserMetadata(auth.userId, {
        publicMetadata: profileData,
      })

      return Response.json({ success: true, redirect: "/" })
    } catch {
      return Response.json({
        success: false,
        error: "アカウントの設定に失敗しました。しばらくしてから再度お試しください。",
      })
    }
  }

  return Response.json({ success: false, error: "無効なアクションです" }, { status: 400 })
}

// MARK: Component
export default function OnboardingPage(args: Route.ComponentProps) {
  const navigate = useNavigate()
  const fetcher = useFetcher()
  const [hasRetried, setHasRetried] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [getGradeAtDate, setGetGradeAtDate] = useState<Date | undefined>()
  const { loaderData } = args

  // loaderからの状態を判定
  const hasLoaderError = loaderData && "hasError" in loaderData && loaderData.hasError
  const needsProfileSetup =
    loaderData && "needsProfileSetup" in loaderData && loaderData.needsProfileSetup
  const errorMessage = hasLoaderError ? loaderData.error : null
  const requiresReSignup = hasLoaderError ? loaderData.requiresReSignup : false
  const setupMessage = needsProfileSetup ? loaderData.message : null

  // fetcher.dataからサーバーアクションの結果を監視
  useEffect(() => {
    if (fetcher.data && typeof fetcher.data === "object") {
      const result = fetcher.data as {
        success: boolean
        error?: string
        redirect?: string
        requiresReSignup?: boolean
        errors?: Record<string, string>
      }

      if (result.success && result.redirect) {
        navigate(result.redirect, { replace: true })
      } else if (!result.success) {
        if (result.requiresReSignup) {
          // 再サインアップが必要な場合
          setTimeout(() => {
            navigate("/sign-up", { replace: true })
          }, 3000)
        }
      }
    }
  }, [fetcher.data, navigate])

  // Handle errors separately
  const errorData = useMemo(() => {
    if (fetcher.data && typeof fetcher.data === "object") {
      const result = fetcher.data as { success: boolean; errors?: Record<string, string> }
      return !result.success && result.errors ? result.errors : null
    }
    return null
  }, [fetcher.data])

  // Update errors when errorData changes
  if (errorData && errorData !== errors) {
    setErrors(errorData)
  }

  // 自動タイムアウト（エラーが発生した場合のフォールバック）
  useEffect(() => {
    if (hasLoaderError && requiresReSignup) {
      const timer = setTimeout(() => {
        navigate("/sign-up", { replace: true })
      }, 10000) // 10秒後にタイムアウト

      return () => clearTimeout(timer)
    }
  }, [hasLoaderError, requiresReSignup, navigate])

  const handleRetry = () => {
    setHasRetried(true)
    fetcher.submit({ actionType: "retry" }, { method: "post" })
  }

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({}) // エラーをクリア

    const formData = new FormData(e.currentTarget as HTMLFormElement)
    formData.set("actionType", "setupProfile")

    fetcher.submit(formData, { method: "post" })
  }

  // プロファイル設定が必要な場合のフォーム表示
  if (needsProfileSetup) {
    return (
      <div className={style.card.container({ class: "max-w-md mx-auto" })}>
        <h1 className={style.text.sectionTitle()}>プロファイル設定</h1>
        <p className="mt-4 text-slate-600 dark:text-slate-400 mb-6 text-center">
          {setupMessage}
        </p>

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="year">学年</Label>
            <Select name="year" defaultValue="b1" required>
              <SelectTrigger id="year">
                <SelectValue aria-placeholder="学年を選択" />
              </SelectTrigger>
              <SelectContent>{yearOptions()}</SelectContent>
            </Select>
            {errors.year && (
              <p className="text-sm font-medium text-destructive">{errors.year}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="grade">現在の級段位</Label>
            <Select name="grade" defaultValue="0" required>
              <SelectTrigger id="grade">
                <SelectValue aria-placeholder="級段位を選択" />
              </SelectTrigger>
              <SelectContent>{gradeOptions()}</SelectContent>
            </Select>
            {errors.grade && (
              <p className="text-sm font-medium text-destructive">{errors.grade}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="joinedAt">入部年度</Label>
            <Input
              id="joinedAt"
              name="joinedAt"
              type="number"
              defaultValue={new Date().getFullYear().toString()}
              required
              min={JoinedAtYearRange.min}
              max={JoinedAtYearRange.max}
            />
            {errors.joinedAt && (
              <p className="text-sm font-medium text-destructive">{errors.joinedAt}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="getGradeAt">級段位取得日</Label>
            <DatePicker
              date={getGradeAtDate}
              onSelect={setGetGradeAtDate}
              placeholder="級段位取得日を選択"
            />
            <input
              type="hidden"
              name="getGradeAt"
              value={getGradeAtDate ? getGradeAtDate.toISOString().split("T")[0] : ""}
            />
            {errors.getGradeAt && (
              <p className="text-sm font-medium text-destructive">{errors.getGradeAt}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={fetcher.state === "submitting"}
            className="w-full"
          >
            {fetcher.state === "submitting" && (
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
            )}
            {fetcher.state === "submitting" ? "設定中..." : "プロファイルを設定"}
          </Button>
        </form>

        {fetcher.data &&
          typeof fetcher.data === "object" &&
          !fetcher.data.success &&
          fetcher.data.error && (
            <div className={style.text.error({ className: "mt-4 text-center" })}>
              {fetcher.data.error}
            </div>
          )}
      </div>
    )
  }

  // ローダーでエラーが発生している場合の表示
  if (hasLoaderError) {
    return (
      <div className={style.card.container({ class: "max-w-md mx-auto text-center" })}>
        <h1 className={style.text.sectionTitle()}>アカウント設定エラー</h1>
        <div className="mt-6">
          <div className="text-red-600 mb-4">
            <svg
              className="w-12 h-12 mx-auto mb-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
        <p className="mt-4 text-slate-600 dark:text-slate-400 mb-6">{errorMessage}</p>

        {requiresReSignup ? (
          <div className="space-y-4">
            <p className="text-sm text-slate-500">
              3秒後に自動的にサインアップページにリダイレクトします...
            </p>
            <button
              onClick={() => navigate("/sign-up", { replace: true })}
              className={style.button({ type: "primary" })}
            >
              今すぐサインアップページへ
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <button
              onClick={handleRetry}
              disabled={fetcher.state === "submitting" || hasRetried}
              className={style.button({ type: "primary" })}
            >
              {fetcher.state === "submitting"
                ? "再試行中..."
                : hasRetried
                  ? "再試行済み"
                  : "再試行"}
            </button>
            {fetcher.data &&
              typeof fetcher.data === "object" &&
              !fetcher.data.success && (
                <p className="text-sm text-red-600 mt-2">
                  {fetcher.data.error || "再試行に失敗しました"}
                </p>
              )}
            <p className="text-sm text-slate-500">
              問題が続く場合は、サポートにお問い合わせください。
            </p>
          </div>
        )}
      </div>
    )
  }

  // 正常な場合のローディング表示
  return (
    <div className={style.card.container({ class: "max-w-md mx-auto text-center" })}>
      <h1 className={style.text.sectionTitle()}>アカウントを設定中...</h1>
      <div className="mt-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
      </div>
      <p className="mt-4 text-slate-600 dark:text-slate-400">
        アカウントの初期設定を行っています。
        <br />
        しばらくお待ちください。
      </p>
    </div>
  )
}

// 学年・級の選択肢生成（sign-upと同じ関数）
function yearOptions() {
  return year.map(y => (
    <SelectItem key={y.year} value={y.year}>
      {y.name}
    </SelectItem>
  ))
}

function gradeOptions() {
  return grade.map(g => (
    <SelectItem key={g.grade} value={String(g.grade)}>
      {g.name}
    </SelectItem>
  ))
}
