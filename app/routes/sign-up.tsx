/* eslint-disable react-refresh/only-export-components */
import { useSignUp } from "@clerk/react-router"
import { getAuth } from "@clerk/react-router/server"
import type { ClerkAPIError } from "@clerk/types"
import { ArkErrors } from "arktype"
import { useCallback, useEffect, useState } from "react"
import { Link, redirect, useFetcher, useNavigate } from "react-router"

import type { Route } from "./+types/sign-up"

import { ProgressIndicator } from "~/components/component/sign-up/ProgressIndicator"
import { SignUpStepBasic } from "~/components/component/sign-up/SignUpStepBasic"
import { SignUpStepPersonal } from "~/components/component/sign-up/SignUpStepPersonal"
import { SignUpStepProfile } from "~/components/component/sign-up/SignUpStepProfile"
import type { ClientActionReturn } from "~/hooks/useSignUpForm"
import { formDataSchema, useSignUpForm } from "~/hooks/useSignUpForm"
import { style } from "~/styles/component"

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

  const parsed = formDataSchema({
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

  if (parsed instanceof ArkErrors) {
    return {
      success: false,
      errors: Object.fromEntries(
        Object.entries(parsed.byPath).map(([key, value]) => [
          key || "general",
          value?.message ?? "不正な値です",
        ]),
      ),
    }
  }

  return { success: true, formData: parsed }
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

// MARK: Component
export default function SignUpPage(props: Route.ComponentProps) {
  const { signUp, isLoaded } = useSignUp()
  const { currentYear } = props.loaderData
  const fetcher = useFetcher()
  const navigate = useNavigate()

  const { state, dispatch, nextStep, prevStep, validateStep } = useSignUpForm(currentYear)
  const { step, clerkErrors, formErrors, formValues, isSignUpCreated } = state

  const [hydrated] = useState(() => typeof window !== "undefined")

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
    async (validatedData: typeof formDataSchema.infer) => {
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
        // result.formData should already be validated by clientAction
        handleClerkSignUp(result.formData)
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
        <div className={step === "basic" ? "" : "hidden"}>
          <SignUpStepBasic
            formValues={formValues}
            formErrors={formErrors}
            dispatch={dispatch}
            fetcher={fetcher}
            isSignUpCreated={isSignUpCreated}
            handleNext={handleNext}
          />
        </div>

        <div className={step === "personal" ? "" : "hidden"}>
          <SignUpStepPersonal
            formValues={formValues}
            formErrors={formErrors}
            dispatch={dispatch}
            fetcher={fetcher}
            isSignUpCreated={isSignUpCreated}
            handleNext={handleNext}
            prevStep={prevStep}
          />
        </div>

        <div className={step === "profile" ? "" : "hidden"}>
          <SignUpStepProfile
            formValues={formValues}
            formErrors={formErrors}
            dispatch={dispatch}
            fetcher={fetcher}
            isSignUpCreated={isSignUpCreated}
            prevStep={prevStep}
            canSubmit={canSubmit}
          />
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
