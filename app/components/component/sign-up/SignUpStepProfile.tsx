import type { FetcherWithComponents } from "react-router"
import { Link } from "react-router"

import { Button } from "@/app/components/ui/button"
import { Checkbox } from "@/app/components/ui/checkbox"
import { DatePicker } from "@/app/components/ui/date-picker"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select"
import type {
  ClientActionReturn,
  FormAction,
  LocalFormState,
} from "@/app/hooks/useSignUpForm"
import { JoinedAtYearRange, grade, year } from "@/app/lib/utils"
import { style } from "@/app/styles/component"

interface SignUpStepProfileProps {
  formValues: LocalFormState
  formErrors: Record<string, string>
  dispatch: React.Dispatch<FormAction>
  fetcher: FetcherWithComponents<ClientActionReturn>
  isSignUpCreated: boolean
  prevStep: () => void
  canSubmit: boolean
}

// 学年・級の選択肢生成
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

export function SignUpStepProfile({
  formValues,
  formErrors,
  dispatch,
  fetcher,
  isSignUpCreated,
  prevStep,
  canSubmit,
}: SignUpStepProfileProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">プロファイル情報</h2>
      <div className="space-y-2">
        <Label htmlFor="year" className={style.label.required()}>
          学年
        </Label>
        <Select
          name="year"
          required
          value={formValues.year}
          onValueChange={value =>
            dispatch({
              type: "SET_FORM_VALUES",
              payload: { year: value ?? formValues.year },
            })
          }
        >
          <SelectTrigger id="year">
            <SelectValue aria-placeholder="学年を選択" />
          </SelectTrigger>
          <SelectContent>{yearOptions()}</SelectContent>
        </Select>
        {formErrors.year && (
          <p className="text-sm font-medium text-destructive">{formErrors.year}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="grade" className={style.label.required()}>
          現在の級段位
        </Label>
        <Select
          name="grade"
          required
          value={String(formValues.grade)}
          onValueChange={value =>
            dispatch({ type: "SET_FORM_VALUES", payload: { grade: Number(value) } })
          }
        >
          <SelectTrigger id="grade">
            <SelectValue aria-placeholder="級段位を選択" />
          </SelectTrigger>
          <SelectContent>{gradeOptions()}</SelectContent>
        </Select>
        {formErrors.grade && (
          <p className="text-sm font-medium text-destructive">{formErrors.grade}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="joinedAt" className={style.label.required()}>
          入部年度
        </Label>
        <Input
          id="joinedAt"
          name="joinedAt"
          type="number"
          required
          min={JoinedAtYearRange.min}
          max={JoinedAtYearRange.max}
          value={formValues.joinedAt ?? ""}
          onChange={e =>
            dispatch({
              type: "SET_FORM_VALUES",
              payload: { joinedAt: Number(e.target.value) },
            })
          }
        />
        {formErrors.joinedAt && (
          <p className="text-sm font-medium text-destructive">{formErrors.joinedAt}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="getGradeAt">級段位取得日</Label>
        <DatePicker
          date={formValues.getGradeAt ? new Date(formValues.getGradeAt) : undefined}
          onSelect={date =>
            dispatch({
              type: "SET_FORM_VALUES",
              payload: { getGradeAt: date ? date.toISOString().split("T")[0] : "" },
            })
          }
          placeholder="級段位取得日を選択"
        />
        {formErrors.getGradeAt && (
          <p className="text-sm font-medium text-destructive">{formErrors.getGradeAt}</p>
        )}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <Checkbox
          id="legalAccepted"
          name="legalAccepted"
          required
          checked={formValues.legalAccepted}
          onCheckedChange={checked =>
            dispatch({ type: "SET_FORM_VALUES", payload: { legalAccepted: !!checked } })
          }
        />
        <Label
          htmlFor="legalAccepted"
          className={style.label.required({
            class: "text-gray-898 text-sm font-normal dark:text-gray-300",
          })}
        >
          <Link
            to="https://omu-aikido.com/terms-of-service/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            利用規約
          </Link>
          および
          <Link
            to="https://omu-aikido.com/privacy-policy/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            プライバシーポリシー
          </Link>
          に同意します
        </Label>
      </div>
      {formErrors.legalAccepted && (
        <p className="text-sm font-medium text-destructive">{formErrors.legalAccepted}</p>
      )}

      <div className="flex gap-2">
        <Button
          type="button"
          variant="secondary"
          onClick={prevStep}
          className="flex-1"
          data-testid="sign-up-button-back-profile"
        >
          戻る
        </Button>

        <Button
          type="submit"
          className="flex-1"
          disabled={!canSubmit}
          data-testid="sign-up-button-submit"
        >
          {(fetcher.state !== "idle" || isSignUpCreated) && (
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          )}
          {fetcher.state !== "idle" || isSignUpCreated ? "処理中..." : "アカウントを作成"}
        </Button>
      </div>
    </div>
  )
}
