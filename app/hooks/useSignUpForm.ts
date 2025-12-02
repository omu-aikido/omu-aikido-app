import type { ClerkAPIError } from "@clerk/types"
import { useReducer } from "react"
import { z } from "zod"

import { JoinedAtYearRange, year } from "~/lib/utils"

export const formDataSchema = z.object({
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

export type ClientActionReturn =
  | { success: true; formData: z.infer<typeof formDataSchema> }
  | { success: false; errors: Record<string, string> }

const localformState = formDataSchema
  .extend({ confirmPassword: z.string() })
  .omit({ getGradeAt: true })
  .extend({ getGradeAt: z.string(), grade: z.number().int().min(-4).max(5).default(0) })

export type LocalFormState = z.infer<typeof localformState>

export type FormState = {
  step: "basic" | "personal" | "profile"
  clerkErrors: ClerkAPIError[]
  formErrors: Record<string, string>
  formValues: LocalFormState
  isSignUpCreated: boolean // Clerkサインアップ処理の重複防止フラグ
}

export type FormAction =
  | { type: "SET_STEP"; payload: "basic" | "personal" | "profile" }
  | { type: "SET_FORM_VALUES"; payload: Partial<LocalFormState> }
  | { type: "SET_FORM_ERRORS"; payload: Record<string, string> }
  | { type: "SET_CLERK_ERRORS"; payload: ClerkAPIError[] }
  | { type: "SET_IS_SIGN_UP_CREATED"; payload: boolean }
  | { type: "RESET_STATE" } // 状態を初期値に戻すアクション

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

export function useSignUpForm(currentYear: number) {
  const [state, dispatch] = useReducer(formReducer, getInitialFormState(currentYear))
  const { step, formValues } = state

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

  return {
    state,
    dispatch,
    nextStep,
    prevStep,
    validateStep,
  }
}
