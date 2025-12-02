import type { FetcherWithComponents } from "react-router"

import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import type { ClientActionReturn, FormAction, LocalFormState } from "~/hooks/useSignUpForm"
import { style } from "~/styles/component"

type SignUpStepBasicProps = {
  formValues: LocalFormState
  formErrors: Record<string, string>
  dispatch: React.Dispatch<FormAction>
  fetcher: FetcherWithComponents<ClientActionReturn>
  isSignUpCreated: boolean
  handleNext: (e?: React.FormEvent) => void
}

export function SignUpStepBasic({
  formValues,
  formErrors,
  dispatch,
  fetcher,
  isSignUpCreated,
  handleNext,
}: SignUpStepBasicProps) {
  return (
    <div className="space-y-4">
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
          <p className="text-sm font-medium text-destructive">{formErrors.newPassword}</p>
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
          // Inline validation to match original behavior, though handleNext also validates.
          // Keeping it for immediate feedback if that was the intention, 
          // but relying on handleNext is cleaner. 
          // I'll stick to calling handleNext directly as it uses the shared validation logic.
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
  )
}
