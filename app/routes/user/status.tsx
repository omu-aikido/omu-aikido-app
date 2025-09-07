import { getAuth } from "@clerk/react-router/ssr.server"
import { useEffect, useState } from "react"
import { redirect, useFetcher } from "react-router"

import type { Route } from "./+types/status"

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
import { StateButton } from "~/components/ui/StateButton"
import { getProfile, updateProfile } from "~/lib/query/profile"
import { grade as gradeOptions } from "~/lib/utils"
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
      className="space-y-4"
      encType={isEditing ? "multipart/form-data" : undefined}
      data-testid={
        isEditing ? "status-form-wrapper-editing" : "status-form-wrapper-viewing"
      }
    >
      <GradeSelect profile={profile} isEditing={isEditing} fetcherState={fetcher.state} />
      <GetGradeAtInput
        profile={profile}
        isEditing={isEditing}
        fetcherState={fetcher.state}
      />
      <JoinedAtInput
        profile={profile}
        isEditing={isEditing}
        fetcherState={fetcher.state}
      />
      <YearSelect profile={profile} isEditing={isEditing} fetcherState={fetcher.state} />

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
    <div className="space-y-2">
      <Label htmlFor="grade">所持級段位</Label>
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
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    profile.getGradeAt ? new Date(profile.getGradeAt) : undefined,
  )

  return (
    <div className="space-y-2">
      <Label htmlFor="getGradeAt">級段位取得日</Label>
      {isEditing ? (
        <>
          <DatePicker
            date={selectedDate}
            onSelect={setSelectedDate}
            placeholder="級段位取得日を選択"
            disabled={disabled}
          />
          <input
            type="hidden"
            name="getGradeAt"
            value={selectedDate ? selectedDate.toISOString().split("T")[0] : ""}
          />
        </>
      ) : (
        <Input
          type="date"
          value={
            profile.getGradeAt
              ? new Date(profile.getGradeAt).toISOString().split("T")[0]
              : ""
          }
          disabled
          readOnly
        />
      )}
    </div>
  )
}

function JoinedAtInput({ profile, isEditing, fetcherState }: FormFieldProps) {
  const disabled = !isEditing || fetcherState === "loading"
  return (
    <div className="space-y-2">
      <Label htmlFor="joinedAt">入部年度</Label>
      <Input
        type="number"
        id="joinedAt"
        name="joinedAt"
        placeholder="4桁の数字"
        required
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
      <Label htmlFor="year">学年</Label>
      <Select name="year" required defaultValue={profile.year} disabled={disabled}>
        <SelectTrigger id="year">
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
