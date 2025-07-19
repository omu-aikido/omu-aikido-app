import { getAuth } from "@clerk/react-router/ssr.server"
import { useEffect, useState } from "react"
import { redirect, useFetcher } from "react-router"

import type { Route } from "./+types/status"

import { NavigationTab } from "~/components/ui/NavigationTab"
import { getProfile, updateProfile } from "~/lib/query/profile"
import { grade as gradeOptions } from "~/lib/utils"
import { style } from "~/styles/component"
import type { Profile } from "~/type"

// MARK: Loader
export async function loader(args: Route.LoaderArgs) {
  const auth = await getAuth(args)
  const userId = auth.userId

  const env = args.context.cloudflare.env

  // Redirect unauthenticated users to sign-in page with redirect URL
  if (!userId) return redirect("/sign-in?redirect_url=" + args.request.url)

  const profile: Profile | null = await getProfile({ userId, env })

  // Return user ID for the component
  return { profile }
}


// MARK: Meta
export function meta({}: Route.MetaArgs) {
  return [
    { title: "ステータス | プロフィール | ハム大合気ポータル" },
    { name: "description", content: "アカウントのステータスを設定できます。" },
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
  const grade = Number(formData.get("grade"))
  const joinedAt = Number(formData.get("joinedAt"))
  const getGradeAt = formData.get("getGradeAt")?.toString()

  const env = args.context.cloudflare.env
  const res = await updateProfile(
    {
      id: userId,
      year,
      grade,
      joinedAt,
      getGradeAt,
    },
    env,
  )

  return res
}

// MARK: Component
export default function ProfilePage(props: Route.ComponentProps) {
  const tab = [
    { to: "/account", label: "プロフィール" },
    { to: "/account/status", label: "ステータス" },
    { to: "/account/security", label: "セキュリティ" },
  ]

  const { profile } = props.loaderData
  const fetcher = useFetcher()
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (fetcher.data) setIsEditing(false)
  }, [fetcher.data])

  if (!profile) {
    return (
      <div className="max-w-lg mx-auto p-4">
        <h1 className="text-xl font-bold mb-4">アカウント</h1>
        <NavigationTab tabs={tab} />
        <p>プロフィール情報が見つかりませんでした。</p>
      </div>
    )
  }

  const FormWrapper = isEditing ? fetcher.Form : "form"

  return (
    <div className="max-w-lg mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">アカウント</h1>
      <NavigationTab tabs={tab} />

      <FormWrapper
        method="post"
        className={style.form.container()}
        encType={isEditing ? "multipart/form-data" : undefined}
      >
        <GradeSelect profile={profile} isEditing={isEditing} fetcherState={fetcher.state} />
        <GetGradeAtInput profile={profile} isEditing={isEditing} fetcherState={fetcher.state} />
        <JoinedAtInput profile={profile} isEditing={isEditing} fetcherState={fetcher.state} />
        <YearSelect profile={profile} isEditing={isEditing} fetcherState={fetcher.state} />

        <div className="flex gap-2">
          {isEditing ? (
            <>
              <button
                type="submit"
                className={style.form.button({ disabled: fetcher.state !== "idle", type: "green" })}
                disabled={fetcher.state !== "idle"}
              >
                {fetcher.state !== "idle" ? "通信中……" : "保存"}
              </button>
              <button
                type="button"
                className={style.form.button({ disabled: fetcher.state !== "idle", type: "gray" })}
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
    </div>
  )
}

// MARK: Form Components
interface FormFieldProps {
  profile: Profile
  isEditing: boolean
  fetcherState: string
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
