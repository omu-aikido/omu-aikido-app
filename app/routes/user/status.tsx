import { useEffect, useState } from "react"
import { useFetcher } from "react-router"

import type { Route } from "./+types/status"

import { isDateString } from "@/type/date"
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
import { uc } from "~/lib/api-client"
import {
  formatDateToJSTString,
  grade as gradeOptions,
  translateGrade,
  translateYear,
} from "~/lib/utils"
import type { Profile } from "~/type"

// MARK: Loader
export async function loader(args: Route.LoaderArgs) {
  const client = uc({ request: args.request })
  const response = await client.profile.$get()
  if (response.status === 404) {
    return { profile: null }
  }
  if (!response.ok) {
    throw new Error("プロフィール情報の取得に失敗しました。")
  }
  const { profile } = await response.json()
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
  const isYearValue = (
    value: string,
  ): value is `b${number}` | `m${number}` | `d${number}` =>
    /^(b[1-4]|m[1-2]|d[1-2])$/.test(value)
  const client = uc({ request: args.request })
  const formData = await args.request.formData()
  const year = formData.get("year")
  const grade = Number(formData.get("grade"))
  const joinedAt = Number(formData.get("joinedAt"))
  const getGradeAtValue = formData.get("getGradeAt")?.toString()
  const getGradeAt =
    getGradeAtValue && getGradeAtValue.length > 0 ? getGradeAtValue : null

  if (typeof year !== "string" || !isYearValue(year)) {
    throw new Error("Invalid year")
  }
  if (!Number.isFinite(grade) || !Number.isFinite(joinedAt)) {
    throw new Error("Invalid profile payload")
  }
  if (getGradeAt !== null && !isDateString(getGradeAt)) {
    throw new Error("Invalid getGradeAt")
  }

  const response = await client.profile.$patch({
    json: { year, grade, joinedAt, getGradeAt },
  })

  if (!response.ok) throw new Error("Failed to update profile")
  const data = (await response.json()) as { profile: Profile }
  return data.profile
}

// MARK: Component
export default function StatusForm({ loaderData, actionData }: Route.ComponentProps) {
  const profile = actionData ?? loaderData.profile
  const fetcher = useFetcher()
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (!isEditing) return
    if (fetcher.state !== "idle") return
    if (!fetcher.data) return
    const id = setTimeout(() => setIsEditing(false), 0)
    return () => clearTimeout(id)
  }, [fetcher.data, fetcher.state, isEditing])

  if (!profile) {
    return <p>プロフィール情報が見つかりませんでした。</p>
  }

  const FormWrapper = isEditing ? fetcher.Form : "div"

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
        <SelectTrigger id="grade" className="w-full">
          <SelectValue aria-placeholder="級段位を選択">
            {value => translateGrade(String(value))}
          </SelectValue>
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
      <DatePicker
        date={selectedDate}
        onSelect={setSelectedDate}
        placeholder="級段位取得日を選択"
        disabled={disabled}
        className="mb-0"
      />
      <input
        type="hidden"
        name="getGradeAt"
        value={selectedDate ? formatDateToJSTString(selectedDate) : ""}
      />
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
        <SelectTrigger id="year" className="w-full">
          <SelectValue aria-placeholder="学年を選択">
            {value => translateYear(String(value))}
          </SelectValue>
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
