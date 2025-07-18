// import { useUser } from "@clerk/react-router"
import { getAuth } from "@clerk/react-router/ssr.server"
import { useEffect, useState } from "react"
import { redirect, useFetcher } from "react-router"

import type { Route } from "./+types/status"

import { NavigationTab } from "~/components/ui/NavigationTab"
import { getProfile, updateProfile } from "~/lib/query/profile"
import { grade as gradeOptions } from "~/lib/utils"
import { style } from "~/styles/component"
import type { Profile } from "~/type"

export function meta({}: Route.MetaArgs) {
  return [{ title: "プロフィール設定" }, { name: "description", content: "プロフィール情報の管理" }]
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

  return (
    <div className="max-w-lg mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">アカウント</h1>
      <NavigationTab tabs={tab} />

      {profile &&
        (isEditing ? (
          <fetcher.Form
            method="post"
            className={style.form.container()}
            encType="multipart/form-data"
          >
            <div>
              <label htmlFor="grade" className={style.form.label({ necessary: true })}>
                所持級段位
              </label>
              <select
                id="grade"
                name="grade"
                required
                className={style.form.select({ disabled: fetcher.state === "loading" })}
                defaultValue={profile.grade}
                disabled={fetcher.state === "loading"}
              >
                {gradeOptions.map(g => (
                  <option key={g.grade} value={g.grade}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="getGradeAt" className={style.form.label()}>
                級段位取得日
              </label>
              <input
                type="date"
                id="getGradeAt"
                name="getGradeAt"
                className={style.form.input({ disabled: fetcher.state === "loading" })}
                defaultValue={
                  profile.getGradeAt ? new Date(profile.getGradeAt).toISOString().split("T")[0] : ""
                }
                disabled={fetcher.state === "loading"}
              />
            </div>
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
                className={style.form.input({ disabled: fetcher.state === "loading" })}
                defaultValue={profile.joinedAt}
                disabled={fetcher.state === "loading"}
              />
            </div>
            <div>
              <label htmlFor="year" className={style.form.label({ necessary: true })}>
                学年
              </label>
              <select
                id="year"
                name="year"
                required
                className={style.form.select({ disabled: fetcher.state === "loading" })}
                defaultValue={profile.year}
                disabled={fetcher.state === "loading"}
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
            <div className="flex gap-2">
              <button
                type="submit"
                className={style.form.button({ disabled: fetcher.state !== "idle", type: "green" })}
                disabled={fetcher.state !== "idle"}
              >
                保存
              </button>
              <button
                type="button"
                className={style.form.button({ disabled: fetcher.state !== "idle", type: "gray" })}
                disabled={fetcher.state !== "idle"}
                onClick={() => setIsEditing(false)}
              >
                キャンセル
              </button>
            </div>
          </fetcher.Form>
        ) : (
          <div>
            <form className={style.form.container()}>
              <div>
                <label htmlFor="grade" className={style.form.label()}>
                  所持級段位
                </label>
                <select
                  id="grade"
                  name="grade"
                  required
                  className={style.form.select({ disabled: true })}
                  value={profile.grade}
                  disabled
                >
                  {gradeOptions.map(g => (
                    <option key={g.grade} value={g.grade}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="getGradeAt" className={style.form.label()}>
                  級段位取得日
                </label>
                <input
                  type="date"
                  id="getGradeAt"
                  name="getGradeAt"
                  className={style.form.input({ disabled: true })}
                  value={
                    profile.getGradeAt
                      ? new Date(profile.getGradeAt).toISOString().split("T")[0]
                      : ""
                  }
                  disabled
                />
              </div>
              <div>
                <label htmlFor="joinedAt" className={style.form.label()}>
                  入部年度
                </label>
                <input
                  type="number"
                  id="joinedAt"
                  name="joinedAt"
                  placeholder="4桁の数字"
                  required
                  className={style.form.input({ disabled: true })}
                  value={profile.joinedAt}
                  disabled
                />
              </div>
              <div>
                <label htmlFor="year" className={style.form.label()}>
                  学年
                </label>
                <select
                  id="year"
                  name="year"
                  required
                  className={style.form.select({ disabled: true })}
                  value={profile.year}
                  disabled
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
            </form>
            <button
              type="button"
              className={style.form.button() + " mt-4"}
              onClick={() => setIsEditing(true)}
            >
              編集
            </button>
          </div>
        ))}
    </div>
  )
}
