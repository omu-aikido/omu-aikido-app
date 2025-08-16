/* eslint-disable react-refresh/only-export-components */
import { useSignUp } from "@clerk/react-router"
import { getAuth } from "@clerk/react-router/ssr.server"
import type { ClerkAPIError } from "@clerk/types"
import { useCallback, useEffect, useReducer, useState } from "react"
import { Link, redirect, useFetcher, useNavigate } from "react-router"
import { tv } from "tailwind-variants"
import z from "zod"

import type { Route } from "./+types/sign-up"

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
  year: z.enum(year.map(y => y.year)),
  grade: z.number().min(-4).max(5),
  joinedAt: z
    .number()
    .min(JoinedAtYearRange.min, "入部年度は2000年から2030年の間で入力してください")
    .max(JoinedAtYearRange.max, "入部年度は2000年から2030年の間で入力してください"),
  getGradeAt: z
    .string()
    .optional()
    .nullable()
    .transform(val => {
      if (!val || val === "") return null
      // 日付の形式を検証
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
  .omit({ joinedAt: true, getGradeAt: true })
  .extend({
    joinedAt: z.string(),
    getGradeAt: z.string(),
    confirmPassword: z.string(),
    grade: z.number().min(-4).max(5).default(0),
  })
  .superRefine((data, ctx) => {
    if (data.newPassword !== data.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        message: "パスワードが一致しません",
        path: ["confirmPassword"],
      })
    }
  })

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
    getGradeAt: data.getGradeAt && data.getGradeAt !== "" ? data.getGradeAt : null,
    legalAccepted: data.legalAccepted === "on",
  })

  if (!parsed.success) {
    const errors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      if (issue.path.length > 0) {
        errors[issue.path[0] as string] = issue.message // 型キャストを追加
      }
    }
    return { success: false, errors }
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
    joinedAt: currentYear.toString(),
    getGradeAt: "",
    legalAccepted: false,
  },
  isSignUpCreated: false,
})

// MARK: Component
export default function SignUpPage(props: Route.ComponentProps) {
  const { signUp, isLoaded } = useSignUp()
  const { currentYear } = props.loaderData
  const fetcher = useFetcher()
  const navigate = useNavigate()

  const [state, dispatch] = useReducer(formReducer, getInitialFormState(currentYear))
  const { step, clerkErrors, formErrors, formValues, isSignUpCreated } = state

  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { setHydrated(true); }, []);
  const disabled = !hydrated || step !== "profile" || !isLoaded || !signUp || fetcher.state !== "idle" || isSignUpCreated;
  const canSubmit = !disabled;

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

        // Clerkのエラーメッセージを安全に取得
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
    let schema: z.ZodSchema

    if (currentStep === "basic") {
      schema = localformState.pick({
        email: true,
        newPassword: true,
        confirmPassword: true,
      })
    } else if (currentStep === "personal") {
      schema = localformState.pick({ firstName: true, lastName: true, username: true })
    } else if (currentStep === "profile") {
      schema = localformState.pick({
        year: true,
        grade: true,
        joinedAt: true,
        getGradeAt: true,
        legalAccepted: true,
      })
    } else {
      dispatch({ type: "SET_FORM_ERRORS", payload: { general: "不明なステップです" } })
      return false
    }

    const parsed = schema.safeParse(formValues)
    if (!parsed.success) {
      const newErrors: Record<string, string> = {}
      for (const issue of parsed.error.issues) {
        if (issue.path.length > 0) {
          newErrors[issue.path[0] as string] = issue.message // 型キャストを追加
        }
      }
      dispatch({ type: "SET_FORM_ERRORS", payload: newErrors })
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
    fd.append("joinedAt", formValues.joinedAt)
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
    <div className={style.card.container({ class: "max-w-md mx-auto" })}>
      <h1 className={style.text.sectionTitle()}>サインアップ</h1>
      <ProgressIndicator step={step} />
      <fetcher.Form method="post" onSubmit={handleSubmit}>
        <div
          className={`${style.form.container({ vertical: true })} ${step === "basic" ? "" : "hidden"}`}
        >
          <h2 className="col-span-3 text-lg font-semibold mb-2">基本情報</h2>
          <label htmlFor="email" className={style.form.label({ necessary: true })}>
            メールアドレス
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className={style.form.input({ class: "col-span-2" })}
            value={formValues.email}
            onChange={e =>
              dispatch({ type: "SET_FORM_VALUES", payload: { email: e.target.value } })
            }
          />
          {formErrors.email && (
            <div className={style.text.error({ className: "col-span-3" })}>
              {formErrors.email}
            </div>
          )}
          <label htmlFor="password" className={style.form.label({ necessary: true })}>
            パスワード
          </label>
          <input
            id="password"
            name="newPassword"
            type="password"
            autoComplete="new-password"
            required
            className={style.form.input({ class: "col-span-2" })}
            value={formValues.newPassword}
            onChange={e =>
              dispatch({
                type: "SET_FORM_VALUES",
                payload: { newPassword: e.target.value },
              })
            }
          />
          {formErrors.newPassword && (
            <div className={style.text.error({ className: "col-span-3" })}>
              {formErrors.newPassword}
            </div>
          )}
          <label
            htmlFor="password-confirm"
            className={style.form.label({ necessary: true })}
          >
            パスワード確認
          </label>
          <input
            id="password-confirm"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            className={style.form.input({ class: "col-span-2" })}
            value={formValues.confirmPassword}
            onChange={e =>
              dispatch({
                type: "SET_FORM_VALUES",
                payload: { confirmPassword: e.target.value },
              })
            }
          />
          {formErrors.confirmPassword && (
            <div className={style.text.error({ className: "col-span-3" })}>
              {formErrors.confirmPassword}
            </div>
          )}
          <button
            type="button"
            onClick={handleNext}
            className={style.button({ type: "primary", class: "col-span-3" })}
            disabled={fetcher.state !== "idle" || isSignUpCreated}
          >
            <div className="flex items-center justify-center gap-2">
              {(fetcher.state !== "idle" || isSignUpCreated) && (
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              )}
              <span>次へ</span>
            </div>
          </button>
        </div>

        <div
          className={`${style.form.container({ vertical: true })} ${step === "personal" ? "" : "hidden"}`}
        >
          <h2 className="col-span-3 text-lg font-semibold mb-2">個人情報</h2>
          <label htmlFor="lastName" className={style.form.label({ necessary: true })}>
            姓
          </label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            autoComplete="family-name"
            required
            className={style.form.input({ class: "col-span-2" })}
            value={formValues.lastName}
            onChange={e =>
              dispatch({ type: "SET_FORM_VALUES", payload: { lastName: e.target.value } })
            }
          />
          {formErrors.lastName && (
            <div className={style.text.error({ className: "col-span-3" })}>
              {formErrors.lastName}
            </div>
          )}
          <label htmlFor="firstName" className={style.form.label({ necessary: true })}>
            名
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            autoComplete="given-name"
            required
            className={style.form.input({ class: "col-span-2" })}
            value={formValues.firstName}
            onChange={e =>
              dispatch({
                type: "SET_FORM_VALUES",
                payload: { firstName: e.target.value },
              })
            }
          />
          {formErrors.firstName && (
            <div className={style.text.error({ className: "col-span-3" })}>
              {formErrors.firstName}
            </div>
          )}
          <label htmlFor="username" className={style.form.label({ necessary: false })}>
            ユーザー名
          </label>
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            className={style.form.input({ class: "col-span-2" })}
            value={formValues.username}
            onChange={e =>
              dispatch({ type: "SET_FORM_VALUES", payload: { username: e.target.value } })
            }
          />
          {formErrors.username && (
            <div className={style.text.error({ className: "col-span-3" })}>
              {formErrors.username}
            </div>
          )}
          <div className="col-span-3 flex gap-2">
            <button
              type="button"
              onClick={prevStep}
              className={style.button({ type: "secondary", class: "flex-1" })}
            >
              戻る
            </button>
            <button
              type="button"
              onClick={handleNext}
              className={style.button({ type: "primary", class: "flex-1" })}
              disabled={fetcher.state !== "idle" || isSignUpCreated}
            >
              <div className="flex items-center justify-center gap-2">
                {(fetcher.state !== "idle" || isSignUpCreated) && (
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                )}
                <span>次へ</span>
              </div>
            </button>
          </div>
        </div>

        <div
          className={`${style.form.container({ vertical: true })} ${step === "profile" ? "" : "hidden"}`}
        >
          <h2 className="col-span-3 text-lg font-semibold mb-2">プロファイル情報</h2>
          <label htmlFor="year" className={style.form.label({ necessary: true })}>
            学年
          </label>
          <select
            id="year"
            name="year"
            required
            className={style.form.input({ class: "col-span-2" })}
            value={formValues.year}
            onChange={e =>
              dispatch({ type: "SET_FORM_VALUES", payload: { year: e.target.value } })
            }
          >
            {yearOptions()}
          </select>
          {formErrors.year && (
            <div className={style.text.error({ className: "col-span-3" })}>
              {formErrors.year}
            </div>
          )}
          <label htmlFor="grade" className={style.form.label({ necessary: true })}>
            現在の級段位
          </label>
          <select
            id="grade"
            name="grade"
            required
            className={style.form.input({ class: "col-span-2" })}
            value={formValues.grade}
            onChange={e =>
              dispatch({
                type: "SET_FORM_VALUES",
                payload: { grade: Number(e.target.value) },
              })
            }
          >
            {gradeOptions()}
          </select>
          {formErrors.grade && (
            <div className={style.text.error({ className: "col-span-3" })}>
              {formErrors.grade}
            </div>
          )}
          <label htmlFor="joinedAt" className={style.form.label({ necessary: true })}>
            入部年度
          </label>
          <input
            id="joinedAt"
            name="joinedAt"
            type="number"
            required
            className={style.form.input({ class: "col-span-2" })}
            min={JoinedAtYearRange.min}
            max={JoinedAtYearRange.max}
            value={formValues.joinedAt}
            onChange={e =>
              dispatch({ type: "SET_FORM_VALUES", payload: { joinedAt: e.target.value } })
            }
          />
          {formErrors.joinedAt && (
            <div className={style.text.error({ className: "col-span-3" })}>
              {formErrors.joinedAt}
            </div>
          )}
          <label htmlFor="getGradeAt" className={style.form.label({ necessary: false })}>
            級段位取得日
          </label>
          <input
            id="getGradeAt"
            name="getGradeAt"
            type="date"
            className={style.form.input({ class: "col-span-2" })}
            value={formValues.getGradeAt}
            onChange={e =>
              dispatch({
                type: "SET_FORM_VALUES",
                payload: { getGradeAt: e.target.value },
              })
            }
          />
          {formErrors.getGradeAt && (
            <div className={style.text.error({ className: "col-span-3" })}>
              {formErrors.getGradeAt}
            </div>
          )}

          <div className="col-span-3 flex items-start gap-3 mt-4">
            <input
              id="legalAccepted"
              name="legalAccepted"
              type="checkbox"
              required
              className="mt-1 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              checked={formValues.legalAccepted}
              onChange={e =>
                dispatch({
                  type: "SET_FORM_VALUES",
                  payload: { legalAccepted: e.target.checked },
                })
              }
            />
            <label
              htmlFor="legalAccepted"
              className="text-sm text-gray-898 dark:text-gray-300"
            >
              <a
                href="https://omu-aikido.com/terms-of-service/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
              >
                利用規約
              </a>
              および
              <a
                href="https://omu-aikido.com/privacy-policy/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
              >
                プライバシーポリシー
              </a>
              に同意します
            </label>
          </div>
          {formErrors.legalAccepted && (
            <div className={style.text.error({ className: "col-span-3" })}>
              {formErrors.legalAccepted}
            </div>
          )}

          <div className="col-span-3 flex gap-2">
            <button
              type="button"
              onClick={prevStep}
              className={style.button({ type: "secondary", class: "flex-1" })}
            >
              戻る
            </button>

            <button
              type="submit"
              className={style.button({ type: "primary", class: "flex-1" })}
              disabled={disabled}
            >
              <div className="flex items-center justify-center gap-2">
                {(fetcher.state !== "idle" || isSignUpCreated) && (
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                )}
                <span>
                  {fetcher.state !== "idle" || isSignUpCreated
                    ? "処理中..."
                    : "アカウントを作成"}
                </span>
              </div>
            </button>
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
    <option key={y.year} value={y.year}>
      {y.name}
    </option>
  ))
}

function gradeOptions() {
  return grade.map(g => (
    <option key={g.grade} value={g.grade}>
      {g.name}
    </option>
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
