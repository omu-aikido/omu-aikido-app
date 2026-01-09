import type { ClerkAPIError } from '@clerk/types'

import { useClerk } from '@clerk/vue'
import { type, ArkErrors } from 'arktype'
import { reactive, readonly, ref } from 'vue'

// Schema for form data validation using ArkType
const formDataSchema = type({
  email: /.+@.+\..+/,
  newPassword: '10<=string<=100',
  firstName: '2<=string<=50',
  lastName: '2<=string<=50',
  username: "6<=string<=50 | '' | undefined",
  year: 'string',
  grade: 'number',
  joinedAt: 'number',
  getGradeAt: 'string | null',
  legalAccepted: 'boolean',
})

// Type inference from the schema
export type SignUpFormData = typeof formDataSchema.infer
export type FormErrors = Record<keyof SignUpFormData | 'general', string>

type SignUpStep = 'basic' | 'personal' | 'profile'

export function useSignUpForm(currentYear: number) {
  const clerk = useClerk()

  const step = ref<SignUpStep>('basic')

  const formValues = reactive<SignUpFormData>({
    email: '',
    newPassword: '',
    firstName: '',
    lastName: '',
    username: undefined,
    year: 'b1',
    grade: 0,
    joinedAt: currentYear,
    getGradeAt: null,
    legalAccepted: false,
  })

  const formErrors = reactive<Partial<FormErrors>>({})
  const clerkErrors = ref<ClerkAPIError[]>([])
  const isSignUpCreated = ref(false)

  const validateStep = (currentStep: SignUpStep): boolean => {
    // Clear previous errors
    Object.keys(formErrors).forEach((key) => delete formErrors[key as keyof FormErrors])

    let schema
    switch (currentStep) {
      case 'basic':
        schema = type({ email: /.+@.+\..+/, newPassword: '10<=string<=100' })
        break
      case 'personal':
        schema = type({
          firstName: '2<=string<=50',
          lastName: '2<=string<=50',
          username: "6<=string<=50 | '' | undefined",
        })
        break
      case 'profile':
        schema = type({
          year: 'string',
          grade: 'number',
          joinedAt: 'number',
          getGradeAt: 'string | null',
          legalAccepted: 'true',
        })
        break
      default:
        return false
    }

    const result = schema(formValues)

    if (result instanceof ArkErrors) {
      for (const error of result) {
        formErrors[error.path[0] as keyof FormErrors] = error.message
      }
      return false
    }
    return true
  }

  const nextStep = () => {
    if (step.value === 'basic') step.value = 'personal'
    else if (step.value === 'personal') step.value = 'profile'
  }

  const prevStep = () => {
    if (step.value === 'profile') step.value = 'personal'
    else if (step.value === 'personal') step.value = 'basic'
  }

  const setFormValue = <K extends keyof SignUpFormData>(key: K, value: SignUpFormData[K]) => {
    formValues[key] = value
    // Clear error on change
    if (key in formErrors) {
      delete formErrors[key as keyof FormErrors]
    }
  }

  // This function will be moved to useSignUp.ts and adapted
  const handleClerkSignUp = async () => {
    if (!clerk.value?.loaded || isSignUpCreated.value) {
      if (!isSignUpCreated.value) {
        formErrors.general = 'Authentication service is not available'
      }
      return false
    }

    const fullValidation = formDataSchema(formValues)
    if (fullValidation instanceof ArkErrors) {
      formErrors.general = 'Form is invalid.'
      return false
    }

    isSignUpCreated.value = true
    clerkErrors.value = []
    delete formErrors.general

    try {
      if (!clerk.value.client) {
        throw new Error('Clerk client not available')
      }
      const signUpParams = {
        emailAddress: formValues.email,
        password: formValues.newPassword,
        firstName: formValues.firstName,
        lastName: formValues.lastName,
        ...(formValues.username !== undefined && {
          username: formValues.username,
        }),
        legalAccepted: formValues.legalAccepted,
        unsafeMetadata: {
          year: formValues.year,
          grade: formValues.grade,
          joinedAt: formValues.joinedAt,
          getGradeAt: formValues.getGradeAt,
        },
      }

      await clerk.value.client.signUp.create(signUpParams)
      await clerk.value.client.signUp.prepareEmailAddressVerification({
        strategy: 'email_code',
      })

      return true
    } catch (err: any) {
      isSignUpCreated.value = false // Reset on error
      const errorMsg = 'User registration failed'
      if (err.errors) {
        clerkErrors.value = err.errors as ClerkAPIError[]
      } else {
        formErrors.general = errorMsg
      }
      return false
    }
  }

  return {
    step: readonly(step),
    formValues: readonly(formValues),
    formErrors: readonly(formErrors),
    clerkErrors: readonly(clerkErrors),
    isSignUpCreated: readonly(isSignUpCreated),
    validateStep,
    nextStep,
    prevStep,
    setFormValue,
    handleClerkSignUp,
  }
}
