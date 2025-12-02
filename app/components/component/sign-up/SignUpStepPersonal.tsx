import type { FetcherWithComponents } from "react-router"

import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import type { ClientActionReturn, FormAction, LocalFormState } from "~/hooks/useSignUpForm"
import { style } from "~/styles/component"

type SignUpStepPersonalProps = {
  formValues: LocalFormState
  formErrors: Record<string, string>
  dispatch: React.Dispatch<FormAction>
  fetcher: FetcherWithComponents<ClientActionReturn>
  isSignUpCreated: boolean
  handleNext: (e?: React.FormEvent) => void
  prevStep: () => void
}

export function SignUpStepPersonal({
  formValues,
  formErrors,
  dispatch,
  fetcher,
  isSignUpCreated,
  handleNext,
  prevStep,
}: SignUpStepPersonalProps) {
  return (
    <div className="space-y-4">
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
          <p className="text-sm font-medium text-destructive">{formErrors.lastName}</p>
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
          <p className="text-sm font-medium text-destructive">{formErrors.firstName}</p>
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
          <p className="text-sm font-medium text-destructive">{formErrors.username}</p>
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
  )
}
