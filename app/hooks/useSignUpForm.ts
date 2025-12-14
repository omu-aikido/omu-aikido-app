import type { ClerkAPIError } from "@clerk/types"
import { ArkErrors, type } from "arktype"
import { useReducer } from "react"

import { JoinedAtYearRange, year } from "~/lib/utils"

const yearUnion = year.map(y => `'${y.year}'`).join("|")

export const formDataSchema = type({
  email: "string.email",
  newPassword: "string>7",
  firstName: "string>0",
  lastName: "string>0",
  username: "string?",
  year: yearUnion as unknown as "string",
  grade: "-4 <= number.integer <= 5",
  joinedAt: `${JoinedAtYearRange.min} <= number.integer <= ${JoinedAtYearRange.max}`,
  getGradeAt: "(string & /^\\d{4}-\\d{2}-\\d{2}$/ | null)?",
  legalAccepted: "true",
})

export type ClientActionReturn =
  | { success: true; formData: typeof formDataSchema.infer }
  | { success: false; errors: Record<string, string> }

export type LocalFormState = {
  email: string
  newPassword: string
  confirmPassword: string
  firstName: string
  lastName: string
  username: string
  year: string
  grade: number
  joinedAt: number
  getGradeAt: string
  legalAccepted: boolean
}

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
  const errors: Record<string, string> = {}

  if (!step || step === "basic") {
    const basic = type({
      email: "string.email",
      newPassword: "string>7",
      confirmPassword: "string",
    })({
      email: formValues.email,
      newPassword: formValues.newPassword,
      confirmPassword: formValues.confirmPassword,
    })
    if (basic instanceof ArkErrors) {
      for (const [key, value] of Object.entries(basic.byPath)) {
        errors[key] = value?.message ?? "不正な値です"
      }
    }
    if (formValues.newPassword !== formValues.confirmPassword) {
      errors.confirmPassword = "パスワードが一致しません"
    }
  }

  if (!step || step === "personal") {
    const personal = type({
      firstName: "string>0",
      lastName: "string>0",
      username: "string",
    })({
      firstName: formValues.firstName,
      lastName: formValues.lastName,
      username: formValues.username,
    })
    if (personal instanceof ArkErrors) {
      for (const [key, value] of Object.entries(personal.byPath)) {
        errors[key] = value?.message ?? "不正な値です"
      }
    }
  }

  if (!step || step === "profile") {
    const getGradeAt =
      formValues.getGradeAt && formValues.getGradeAt.length > 0
        ? formValues.getGradeAt
        : null
    const profile = type({
      year: yearUnion as unknown as "string",
      grade: "-4 <= number.integer <= 5",
      joinedAt: `${JoinedAtYearRange.min} <= number.integer <= ${JoinedAtYearRange.max}`,
      getGradeAt: "string & /^\\d{4}-\\d{2}-\\d{2}$/ | null",
      legalAccepted: "true",
    })({
      year: formValues.year,
      grade: formValues.grade,
      joinedAt: formValues.joinedAt,
      getGradeAt,
      legalAccepted: formValues.legalAccepted,
    })
    if (profile instanceof ArkErrors) {
      for (const [key, value] of Object.entries(profile.byPath)) {
        errors[key] = value?.message ?? "不正な値です"
      }
    }
  }

  if (Object.keys(errors).length > 0) return { success: false, errors }
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

  return { state, dispatch, nextStep, prevStep, validateStep }
}
