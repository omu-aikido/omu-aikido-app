import { createClerkClient } from "@clerk/react-router/api.server"
import { getAuth } from "@clerk/react-router/ssr.server"
import { useEffect } from "react"
import type { LoaderFunctionArgs } from "react-router"
import { redirect, useNavigate } from "react-router"

import { style } from "~/styles/component"

// MARK: Loader
export async function loader(
  args: LoaderFunctionArgs & {
    context: { cloudflare: { env: { CLERK_SECRET_KEY: string } } }
  },
) {
  const auth = await getAuth(args)

  // 未認証の場合はサインアップページへ
  if (!auth.isAuthenticated || !auth.userId) {
    return redirect("/sign-up")
  }

  try {
    const clerkClient = createClerkClient({
      secretKey: args.context.cloudflare.env.CLERK_SECRET_KEY!,
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
      return Response.json(
        { error: "プロファイル情報が見つかりません。再度サインアップしてください。" },
        { status: 400 },
      )
    }

    // 値の型・範囲チェック
    const year = typeof unsafeMetadata.year === "string" ? unsafeMetadata.year : undefined
    const grade =
      typeof unsafeMetadata.grade === "number" ? unsafeMetadata.grade : undefined
    const joinedAt =
      typeof unsafeMetadata.joinedAt === "number" &&
      unsafeMetadata.joinedAt >= new Date().getFullYear() - 4 &&
      unsafeMetadata.joinedAt <= new Date().getFullYear() + 4
        ? unsafeMetadata.joinedAt
        : undefined

    let getGradeAt: string = ""
    if (
      unsafeMetadata.getGradeAt !== null &&
      typeof unsafeMetadata.getGradeAt === "string" &&
      unsafeMetadata.getGradeAt.trim() !== ""
    ) {
      const dateStr = unsafeMetadata.getGradeAt.trim()
      const date = new Date(dateStr)
      if (!isNaN(date.getTime())) {
        getGradeAt = date.toISOString()
      }
    }

    if (!year || grade === undefined || joinedAt === undefined) {
      return Response.json(
        { error: "プロファイル情報が不正です。再度サインアップしてください。" },
        { status: 400 },
      )
    }

    // プロファイルデータをpublicMetadataに移動
    const profileData = { year, grade, joinedAt, getGradeAt, role: "member" as const }

    // publicMetadataを更新し、unsafeMetadataをクリア
    await clerkClient.users.updateUserMetadata(auth.userId, {
      publicMetadata: profileData,
      unsafeMetadata: {},
    })

    // ホームページにリダイレクト
    return redirect("/")
  } catch {
    // エラーログ出力
    return Response.json(
      { error: "アカウントの設定に失敗しました。しばらくしてから再度お試しください。" },
      { status: 500 },
    )
  }
}

// MARK: Meta
export function meta() {
  return [
    { title: "アカウント設定中 | ハム大合気ポータル" },
    { name: "description", content: "アカウントの初期設定を行っています" },
  ]
}

// MARK: Component
export default function OnboardingPage() {
  const navigate = useNavigate()

  useEffect(() => {
    // エラーが発生した場合はサインアップページに戻る
    const timer = setTimeout(() => {
      navigate("/sign-up", { replace: true })
    }, 5000) // 5秒後にタイムアウト

    return () => clearTimeout(timer)
  }, [navigate])

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
