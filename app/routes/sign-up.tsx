/* eslint-disable react-refresh/only-export-components */
import { useSignUp } from "@clerk/react-router"
import { getAuth } from "@clerk/react-router/server"
import type { ClerkAPIError } from "@clerk/types"
import { useCallback, useEffect, useReducer, useState } from "react"
import { Link, redirect, useFetcher, useNavigate } from "react-router"
import { tv } from "tailwind-variants"
import z from "zod"

import type { Route } from "./+types/sign-up"

import { Button } from "~/components/ui/button"
import { Checkbox } from "~/components/ui/checkbox"
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
type ClientActionReturn =
  | { success: true; formData: z.infer<typeof formDataSchema> }
  | { success: false; errors: Record<string, string> }

const formDataSchema = z.object({
  email: z.email("有効なメールアドレスを入力してください"),
  newPassword: z.string().min(8, "パスワードは8文字以上である必要があります"),
  firstName: z.string().min(1, "名は必須です"),
  lastName: z.string().min(1, "姓は必須です"),
  username: z.string().optional(),
  year: z.enum(year.map(y => y.year) as [string, ...string[]]),
  grade: z.number().int().min(-4).max(5),
  joinedAt: z
    .number()
    .int()
    .min(
      JoinedAtYearRange.min,
      `入部年度は${JoinedAtYearRange.min}年から${JoinedAtYearRange.max}年の間で入力してください`,
    )
    .max(
      JoinedAtYearRange.max,
      `入部年度は${JoinedAtYearRange.min}年から${JoinedAtYearRange.max}年の間で入力してください`,
    ),
  getGradeAt: z
    .string()
    .optional()
    .nullable()
    .transform(val => {
      if (!val || val === "") return null
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/
      if (!dateRegex.test(val)) return null
      return val
    }),
  legalAccepted: z
    .boolean()
    .refine(
      val => val === true,
      "利用規約とプライバシーポリシーに同意する必要があります",
    ),
})

const localformState = formDataSchema
  .extend({ confirmPassword: z.string() })
  .omit({ getGradeAt: true })
  .extend({ getGradeAt: z.string(), grade: z.number().int().min(-4).max(5).default(0) })

type LocalFormState = z.infer<typeof localformState>

// MARK: Loader
export async function loader(args: Route.LoaderArgs) {
  const auth = await getAuth(args)
  if (auth.isAuthenticated) return redirect("/")
  return { currentYear: new Date().getFullYear() }
}

// MARK: Meta
export function meta() {
  return [
    { title: "サインアップ | ハム大合気ポータル" },
    { name: "description", content: "サインアップページ" },
  ]
}

export async function clientAction({
  request,
}: Route.ClientActionArgs): Promise<ClientActionReturn> {
  const formData = await request.formData()
  const data = Object.fromEntries(formData)

  const parsed = formDataSchema.safeParse({
    email: data.email || "",
    newPassword: data.newPassword || "",
    firstName: data.firstName || "",
    lastName: data.lastName || "",
    username: data.username || undefined,
    year: data.year || "b1",
    grade: data.grade ? Number(data.grade) : 0,
    joinedAt: data.joinedAt ? Number(data.joinedAt) : new Date().getFullYear(),
    getGradeAt:
      data.getGradeAt && data.getGradeAt !== "" ? String(data.getGradeAt) : null,
    legalAccepted: data.legalAccepted === "on",
  })

  if (!parsed.success) {
    return {
      success: false,
      errors: Object.fromEntries(
        parsed.error.issues.map(issue => [issue.path[0] || "general", issue.message]),
      ),
    }
  }

  return { success: true, formData: parsed.data }
}
// Stateの型定義
type FormState = {
  step: "basic" | "personal" | "profile"
  clerkErrors: ClerkAPIError[]
  formErrors: Record<string, string>
  formValues: LocalFormState
  isSignUpCreated: boolean // Clerkサインアップ処理の重複防止フラグ
}

// Actionの型定義
type FormAction =
  | { type: "SET_STEP"; payload: "basic" | "personal" | "profile" }
  | { type: "SET_FORM_VALUES"; payload: Partial<LocalFormState> }
  | { type: "SET_FORM_ERRORS"; payload: Record<string, string> }
  | { type: "SET_CLERK_ERRORS"; payload: ClerkAPIError[] }
  | { type: "SET_IS_SIGN_UP_CREATED"; payload: boolean }
  | { type: "RESET_STATE" } // 状態を初期値に戻すアクション

// Reducer関数
function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, step: action.payload }
    case "SET_FORM_VALUES":
      return { ...state, formValues: { ...state.formValues, ...action.payload } }
    case "SET_FORM_ERRORS":
      return { ...state, formErrors: action.payload }
    case "SET_CLERK_ERRORS":
      return { ...state, clerkErrors: action.payload }
    case "SET_IS_SIGN_UP_CREATED":
      return { ...state, isSignUpCreated: action.payload }
    case "RESET_STATE":
      // formValuesは維持して他をリセット
      const initialFormStateForReset = getInitialFormState(new Date().getFullYear())
      return { ...initialFormStateForReset, formValues: state.formValues }
    default:
      return state
  }
}

const getInitialFormState = (currentYear: number): FormState => ({
  step: "basic",
  clerkErrors: [],
  formErrors: {},
  formValues: {
    email: "",
    newPassword: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    username: "",
    year: "b1",
    grade: 0,
    joinedAt: currentYear,
    getGradeAt: "",
    legalAccepted: false,
  },
  isSignUpCreated: false,
})
// 統一化されたバリデーション関数
const validateFormData = (
  formValues: LocalFormState,
  step?: "basic" | "personal" | "profile",
): { success: true } | { success: false; errors: Record<string, string> } => {
  // ステップ別のスキーマを定義
  const stepSchemas = {
    basic: localformState
      .pick({ email: true, newPassword: true, confirmPassword: true })
      .refine(data => data.newPassword === data.confirmPassword, {
        message: "パスワードが一致しません",
        path: ["confirmPassword"],
      }),
    personal: localformState.pick({ firstName: true, lastName: true, username: true }),
    profile: localformState.pick({
      year: true,
      grade: true,
      joinedAt: true,
      getGradeAt: true,
      legalAccepted: true,
    }),
  }

  const schema = step ? stepSchemas[step] : localformState
  const parsed = schema.safeParse(formValues)

  if (!parsed.success) {
    return {
      success: false,
      errors: Object.fromEntries(
        parsed.error.issues.map(issue => [issue.path[0] || "general", issue.message]),
      ),
    }
  }

  return { success: true }
}

// MARK: Component
export default function SignUpPage(props: Route.ComponentProps) {
  const { signUp, isLoaded } = useSignUp()
  const { currentYear } = props.loaderData
  const fetcher = useFetcher()
  const navigate = useNavigate()

  const [state, dispatch] = useReducer(formReducer, getInitialFormState(currentYear))
  const { step, clerkErrors, formErrors, formValues, isSignUpCreated } = state

  const [hydrated, setHydrated] = useState(false)
  useEffect(() => {
    setHydrated(true)
  }, [])
  const disabled =
    !hydrated ||
    step !== "profile" ||
    !isLoaded ||
    !signUp ||
    fetcher.state !== "idle" ||
    isSignUpCreated
  const canSubmit = !disabled

  // クライアントサイドでのClerk登録処理
  const handleClerkSignUp = useCallback(
    async (validatedData: z.infer<typeof formDataSchema>) => {
      dispatch({ type: "SET_IS_SIGN_UP_CREATED", payload: true })
      if (!isLoaded || !signUp || !validatedData || isSignUpCreated) {
        if (!isSignUpCreated) {
          dispatch({
            type: "SET_FORM_ERRORS",
            payload: { general: "認証サービスが利用できません" },
          })
        }
        return
      }

      try {
        const signUpParams = {
          emailAddress: validatedData.email,
          password: validatedData.newPassword,
          firstName: validatedData.firstName,
          lastName: validatedData.lastName,
          username: validatedData.username,
          unsafeMetadata: {
            year: validatedData.year,
            grade: validatedData.grade,
            joinedAt: validatedData.joinedAt,
            getGradeAt: validatedData.getGradeAt,
          },
          legalAccepted: validatedData.legalAccepted,
        }

        await signUp.create(signUpParams)
        await signUp.prepareEmailAddressVerification({ strategy: "email_code" })
        navigate("/sign-up/verify")
      } catch (err) {
        dispatch({ type: "SET_IS_SIGN_UP_CREATED", payload: false }) // エラー時にフラグをリセット
        const errorMsg = "ユーザー登録に失敗しました"
        if (typeof err === "object" && err && "errors" in err) {
          const extracted = (err as { errors?: ClerkAPIError[] }).errors
          if (extracted && extracted.length > 0) {
            dispatch({ type: "SET_CLERK_ERRORS", payload: extracted })
          }
        } else {
          dispatch({ type: "SET_FORM_ERRORS", payload: { general: errorMsg } })
        }
      }
    },
    [isLoaded, signUp, isSignUpCreated, navigate, dispatch],
  )
  const nextStep = () => {
    if (step === "basic") dispatch({ type: "SET_STEP", payload: "personal" })
    else if (step === "personal") dispatch({ type: "SET_STEP", payload: "profile" })
  }

  const prevStep = () => {
    if (step === "personal") {
      dispatch({ type: "SET_STEP", payload: "basic" })
    } else if (step === "profile") {
      dispatch({ type: "SET_STEP", payload: "personal" })
      dispatch({ type: "SET_IS_SIGN_UP_CREATED", payload: false })
    }
  }

  // 各ステップのバリデーション
  const validateStep = (currentStep: string): boolean => {
    if (!["basic", "personal", "profile"].includes(currentStep)) {
      dispatch({ type: "SET_FORM_ERRORS", payload: { general: "不明なステップです" } })
      return false
    }

    const validation = validateFormData(
      formValues,
      currentStep as "basic" | "personal" | "profile",
    )

    if (!validation.success) {
      dispatch({ type: "SET_FORM_ERRORS", payload: validation.errors })
      return false
    }

    dispatch({ type: "SET_FORM_ERRORS", payload: {} })
    return true
  }

  // ステップ進行処理
  const handleNext = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (validateStep(step)) {
      if (step === "profile") {
        return
      }
      nextStep()
    }
  }

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    if (step !== "profile") {
      nextStep()
      return
    }
    if (!validateStep("profile")) return
    if (!canSubmit) return

    const fd = new FormData()
    fd.append("email", formValues.email)
    fd.append("newPassword", formValues.newPassword)
    fd.append("firstName", formValues.firstName)
    fd.append("lastName", formValues.lastName)
    if (formValues.username) fd.append("username", formValues.username)
    fd.append("year", formValues.year)
    fd.append("grade", formValues.grade.toString())
    fd.append("joinedAt", formValues.joinedAt.toString())
    fd.append("getGradeAt", formValues.getGradeAt)
    if (formValues.legalAccepted) fd.append("legalAccepted", "on")
    fetcher.submit(fd, { method: "post" })
  }

  // clientActionの結果を処理
  useEffect(() => {
    if (fetcher.data && fetcher.state === "idle") {
      const result = fetcher.data as ClientActionReturn

      if (!result.success) {
        const serverErrors = result.errors
        dispatch({ type: "SET_FORM_ERRORS", payload: serverErrors })
        if (
          serverErrors.email ||
          serverErrors.newPassword ||
          serverErrors.confirmPassword
        ) {
          dispatch({ type: "SET_STEP", payload: "basic" })
          dispatch({ type: "SET_IS_SIGN_UP_CREATED", payload: false })
        } else if (
          serverErrors.firstName ||
          serverErrors.lastName ||
          serverErrors.username
        ) {
          dispatch({ type: "SET_STEP", payload: "personal" })
          dispatch({ type: "SET_IS_SIGN_UP_CREATED", payload: false })
        } else if (
          serverErrors.year ||
          serverErrors.grade ||
          serverErrors.joinedAt ||
          serverErrors.getGradeAt ||
          serverErrors.legalAccepted
        ) {
          dispatch({ type: "SET_STEP", payload: "profile" })
          dispatch({ type: "SET_IS_SIGN_UP_CREATED", payload: false })
        }
      } else {
        // result.formData should already be a plain object from clientAction — validate with zod
        try {
          const parsed = formDataSchema.parse(result.formData)
          handleClerkSignUp(parsed)
        } catch {
          dispatch({
            type: "SET_FORM_ERRORS",
            payload: { general: "無効なフォームデータが返されました" },
          })
        }
      }
    }
  }, [fetcher.data, fetcher.state, handleClerkSignUp, dispatch])

  return (
    <div
      className={style.card.container({ class: "max-w-md mx-auto" })}
      data-testid="sign-up-container"
    >
      <h1 className={style.text.sectionTitle()} data-testid="sign-up-title">
        サインアップ
      </h1>
      <ProgressIndicator step={step} />
      <fetcher.Form method="post" onSubmit={handleSubmit} data-testid="sign-up-form">
        <div className={`space-y-4 ${step === "basic" ? "" : "hidden"}`}>
          <h2 className="text-lg font-semibold">基本情報</h2>
          <div className="space-y-2">
            <div>
              <Label htmlFor="email" className={style.label.required()}>
                メールアドレス
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formValues.email}
                onChange={e =>
                  dispatch({
                    type: "SET_FORM_VALUES",
                    payload: { email: e.target.value },
                  })
                }
              />
            </div>
            {formErrors.email && (
              <p className="text-sm font-medium text-destructive">{formErrors.email}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className={style.label.required()}>
              パスワード
            </Label>
            <Input
              id="password"
              name="newPassword"
              type="password"
              autoComplete="new-password"
              required
              value={formValues.newPassword}
              onChange={e =>
                dispatch({
                  type: "SET_FORM_VALUES",
                  payload: { newPassword: e.target.value },
                })
              }
            />
            {formErrors.newPassword && (
              <p className="text-sm font-medium text-destructive">
                {formErrors.newPassword}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password-confirm" className={style.label.required()}>
              パスワード確認
            </Label>
            <Input
              id="password-confirm"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              value={formValues.confirmPassword}
              onChange={e =>
                dispatch({
                  type: "SET_FORM_VALUES",
                  payload: { confirmPassword: e.target.value },
                })
              }
            />
            {formErrors.confirmPassword && (
              <p className="text-sm font-medium text-destructive">
                {formErrors.confirmPassword}
              </p>
            )}
          </div>
          <Button
            type="button"
            onClick={e => {
              if (!z.email(formValues.email).safeParse(formValues.email).success) {
                dispatch({
                  type: "SET_FORM_ERRORS",
                  payload: { email: "メールアドレスの形式が正しくありません" },
                })
                return
              }
              if (formValues.newPassword !== formValues.confirmPassword) {
                dispatch({
                  type: "SET_FORM_ERRORS",
                  payload: { confirmPassword: "パスワードが一致しません" },
                })
                return
              }
              handleNext(e)
            }}
            className="w-full"
            disabled={fetcher.state !== "idle" || isSignUpCreated}
            data-testid="sign-up-button-next-basic"
          >
            {(fetcher.state !== "idle" || isSignUpCreated) && (
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
            )}
            次へ
          </Button>
        </div>

        <div className={`space-y-4 ${step === "personal" ? "" : "hidden"}`}>
          <h2 className="text-lg font-semibold">個人情報</h2>
          <div className="space-y-2">
            <Label htmlFor="lastName" className={style.label.required()}>
              姓
            </Label>
            <Input
              id="lastName"
              name="lastName"
              type="text"
              autoComplete="family-name"
              required
              value={formValues.lastName}
              onChange={e =>
                dispatch({
                  type: "SET_FORM_VALUES",
                  payload: { lastName: e.target.value },
                })
              }
            />
            {formErrors.lastName && (
              <p className="text-sm font-medium text-destructive">
                {formErrors.lastName}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="firstName" className={style.label.required()}>
              名
            </Label>
            <Input
              id="firstName"
              name="firstName"
              type="text"
              autoComplete="given-name"
              required
              value={formValues.firstName}
              onChange={e =>
                dispatch({
                  type: "SET_FORM_VALUES",
                  payload: { firstName: e.target.value },
                })
              }
            />
            {formErrors.firstName && (
              <p className="text-sm font-medium text-destructive">
                {formErrors.firstName}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">ユーザー名</Label>
            <Input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              value={formValues.username}
              onChange={e =>
                dispatch({
                  type: "SET_FORM_VALUES",
                  payload: { username: e.target.value },
                })
              }
            />
            {formErrors.username && (
              <p className="text-sm font-medium text-destructive">
                {formErrors.username}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={prevStep}
              className="flex-1"
              data-testid="sign-up-button-back-personal"
            >
              戻る
            </Button>
            <Button
              type="button"
              onClick={handleNext}
              className="flex-1"
              disabled={fetcher.state !== "idle" || isSignUpCreated}
              data-testid="sign-up-button-next-personal"
            >
              {(fetcher.state !== "idle" || isSignUpCreated) && (
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
              )}
              次へ
            </Button>
          </div>
        </div>

        <div className={`space-y-4 ${step === "profile" ? "" : "hidden"}`}>
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
                dispatch({ type: "SET_FORM_VALUES", payload: { year: value } })
              }
            >
              <SelectTrigger id="year">
                <SelectValue placeholder="学年を選択" />
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
                <SelectValue placeholder="級段位を選択" />
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
              value={formValues.joinedAt}
              onChange={e =>
                dispatch({
                  type: "SET_FORM_VALUES",
                  payload: { joinedAt: Number(e.target.value) },
                })
              }
            />
            {formErrors.joinedAt && (
              <p className="text-sm font-medium text-destructive">
                {formErrors.joinedAt}
              </p>
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
              <p className="text-sm font-medium text-destructive">
                {formErrors.getGradeAt}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 mt-4">
            <Checkbox
              id="legalAccepted"
              name="legalAccepted"
              required
              checked={formValues.legalAccepted}
              onCheckedChange={checked =>
                dispatch({
                  type: "SET_FORM_VALUES",
                  payload: { legalAccepted: !!checked },
                })
              }
            />
            <Label
              htmlFor="legalAccepted"
              className={style.label.required({
                class: "text-sm font-normal text-gray-898 dark:text-gray-300",
              })}
            >
              <Link
                to="https://omu-aikido.com/terms-of-service/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
              >
                利用規約
              </Link>
              および
              <Link
                to="https://omu-aikido.com/privacy-policy/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
              >
                プライバシーポリシー
              </Link>
              に同意します
            </Label>
          </div>
          {formErrors.legalAccepted && (
            <p className="text-sm font-medium text-destructive">
              {formErrors.legalAccepted}
            </p>
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
              disabled={disabled}
              data-testid="sign-up-button-submit"
            >
              {(fetcher.state !== "idle" || isSignUpCreated) && (
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
              )}
              {fetcher.state !== "idle" || isSignUpCreated
                ? "処理中..."
                : "アカウントを作成"}
            </Button>
          </div>
        </div>
        <div className="col-span-3 my-4">
          <div
            id="clerk-captcha"
            data-cl-size="flexible"
            data-cl-theme={usePreferredTheme()}
            data-cl-language="ja-jp"
          />
        </div>
      </fetcher.Form>

      <hr className="my-6" />
      {/*{step === "basic" ? (
        <SignUpWithDiscord
          signUp={signUp}
          loading={loading}
          setLoading={setLoading}
          isLoaded={isLoaded}
        />
      ) : null}*/}
      <div className="mt-4 text-center text-sm text-slate-600 dark:text-slate-400">
        既にアカウントをお持ちですか？
        <br />
        <span className={style.text.link()}>
          <Link to="/sign-in">こちら</Link>
        </span>
        からサインインしてください。
      </div>
      {formErrors.general && (
        <div className={style.text.error({ className: "mt-4" })}>
          {formErrors.general}
        </div>
      )}
      {clerkErrors && clerkErrors.length > 0 && (
        <div className={style.text.error({ className: "mt-4" })}>
          {clerkErrors.map((e, i) => (
            <div key={i}>{e.longMessage ?? e.message ?? JSON.stringify(e)}</div>
          ))}
        </div>
      )}
    </div>
  )
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

const ProgressIndicator = ({ step }: { step: "basic" | "personal" | "profile" }) => {
  const steps = ["基本情報", "個人情報", "プロファイル"]
  const currentIndex =
    step === "basic" ? 0 : step === "personal" ? 1 : step === "profile" ? 2 : 2

  const indicator = tv({
    base: "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
    variants: {
      step: {
        current: "bg-blue-600 text-white",
        completed: "border-2 border-green-600 text-green-600",
        upcoming: "bg-slate-200 text-slate-500 dark:bg-slate-600 dark:text-slate-200",
      },
    },
  })

  return (
    <div className="mb-6 flex justify-center">
      {steps.map((label, idx) => (
        <div key={label} className="flex items-center">
          <div
            className={indicator({
              step:
                idx < currentIndex
                  ? "completed"
                  : idx === currentIndex
                    ? "current"
                    : "upcoming",
            })}
          >
            {idx + 1}
          </div>
          {idx < steps.length - 1 && (
            <div className="w-6 h-0.5 bg-slate-400 dark:bg-slate-500 mx-2" />
          )}
        </div>
      ))}
    </div>
  )
}

function usePreferredTheme() {
  const [theme, setTheme] = useState<"light" | "dark">("light") // サーバーと一致させる安全な初期値

  useEffect(() => {
    const m = window.matchMedia?.("(prefers-color-scheme: dark)")
    if (!m) return

    const apply = () => setTheme(m.matches ? "dark" : "light")
    apply()

    const handler = (e: MediaQueryListEvent) => setTheme(e.matches ? "dark" : "light")
    if (m.addEventListener) m.addEventListener("change", handler)

    return () => {
      if (m.removeEventListener) m.removeEventListener("change", handler)
    }
  }, [])

  return theme
}
