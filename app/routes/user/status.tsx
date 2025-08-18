import { getAuth } from "@clerk/react-router/ssr.server"
import { useEffect, useState } from "react"
import { redirect, useFetcher } from "react-router"

import type { Route } from "./+types/status"

import { StateButton } from "~/components/ui/StateButton"
import { getProfile, updateProfile } from "~/lib/query/profile"
import { grade as gradeOptions } from "~/lib/utils"
import { style } from "~/styles/component"
import type { Profile } from "~/type"

// MARK: Loader
export async function loader(args: Route.LoaderArgs) {
  const auth = await getAuth(args)
  const userId = auth.userId

  const env = args.context.cloudflare.env

  const profile: Profile | null = await getProfile({ userId, env })

  // Return profile data for the component
  return { profile }
}

// MARK: Meta
export function meta({}: Route.MetaArgs) {
  return [
    { title: "ステータス | ハム大合気ポータル" },
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
  const res = await updateProfile({ id: userId, year, grade, joinedAt, getGradeAt }, env)

  return res
}

// MARK: Component
export default function StatusForm({ loaderData }: Route.ComponentProps) {
  const profile = loaderData.profile
  const fetcher = useFetcher()
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (fetcher.data) setIsEditing(false)
  }, [fetcher.data])

  if (!profile) {
    return <p>プロフィール情報が見つかりませんでした。</p>
  }

  const FormWrapper = isEditing ? fetcher.Form : "form"

  return (
    <FormWrapper
      method="post"
      className={style.form.container()}
      encType={isEditing ? "multipart/form-data" : undefined}
      data-testid={
        isEditing ? "status-form-wrapper-editing" : "status-form-wrapper-viewing"
      }
    >
      <GradeSelect
        profile={profile}
        isEditing={isEditing}
        fetcherState={fetcher.state}
        data-testid={
          isEditing ? "grade-select-wrapper-editing" : "grade-selector-wrapper-viewing"
        }
      />
      <GetGradeAtInput
        profile={profile}
        isEditing={isEditing}
        fetcherState={fetcher.state}
        data-testid={
          isEditing ? "grade-at-input-wrapper-editing" : "grade-at-input-wrapper-viewing"
        }
      />
      <JoinedAtInput
        profile={profile}
        isEditing={isEditing}
        fetcherState={fetcher.state}
        data-testid={
          isEditing
            ? "joined-at-input-wrapper-editing"
            : "joined-at-input-wrapper-viewing"
        }
      />
      <YearSelect
        profile={profile}
        isEditing={isEditing}
        fetcherState={fetcher.state}
        data-testid={
          isEditing ? "year-selector-wrapper-editing" : "year-selector-wrapper-viewing"
        }
      />

      <StateButton
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        fetcher={fetcher}
        data-testid={isEditing ? "state-button-editing" : "state-button-viewing"}
      />
    </FormWrapper>
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
        className={style.form.select()}
        defaultValue={profile.grade}
        disabled={disabled}
        data-testid={isEditing ? "grade-select-editing" : "grade-select-viewing"}
      >
        {gradeOptions.map(g => (
          <option
            key={g.grade}
            value={g.grade}
            data-testid={
              isEditing
                ? "grade-select-option-editing-" + g.grade
                : "grade-select-option-viewing-" + g.grade
            }
          >
            {g.name}
          </option>
        ))}
      </select>
    </div>
  )
}

function GetGradeAtInput({ profile, isEditing, fetcherState }: FormFieldProps) {
  const disabled = !isEditing || fetcherState === "loading"
  const value = profile.getGradeAt
    ? new Date(profile.getGradeAt).toISOString().split("T")[0]
    : ""
  return (
    <div>
      <label htmlFor="getGradeAt" className={style.form.label()}>
        級段位取得日
      </label>
      <input
        type="date"
        id="getGradeAt"
        name="getGradeAt"
        className={style.form.input()}
        defaultValue={isEditing ? value : undefined}
        value={!isEditing ? value : undefined}
        disabled={disabled}
        data-testid={isEditing ? "getGradeAt-input-editing" : "getGradeAt-input-viewing"}
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
        className={style.form.input()}
        defaultValue={isEditing ? profile.joinedAt : undefined}
        value={!isEditing ? profile.joinedAt : undefined}
        disabled={disabled}
        data-testid={isEditing ? "joinedAt-input-editing" : "joinedAt-input-viewing"}
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
        className={style.form.select()}
        defaultValue={profile.year}
        disabled={disabled}
        data-testid={isEditing ? "year-select-editing" : "year-select-viewing"}
      >
        <option value="b1" data-testid="year-select-option-b1">
          学部 1年
        </option>
        <option value="b2" data-testid="year-select-option-b2">
          学部 2年
        </option>
        <option value="b3" data-testid="year-select-option-b3">
          学部 3年
        </option>
        <option value="b4" data-testid="year-select-option-b4">
          学部 4年
        </option>
        <option value="m1" data-testid="year-select-option-m1">
          修士 1年
        </option>
        <option value="m2" data-testid="year-select-option-m2">
          修士 2年
        </option>
        <option value="d1" data-testid="year-select-option-d1">
          博士 1年
        </option>
        <option value="d2" data-testid="year-select-option-d2">
          博士 2年
        </option>
      </select>
    </div>
  )
}
