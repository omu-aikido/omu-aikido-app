import type { FetcherWithComponents } from "react-router"

import { style } from "~/styles/component"

export function StateButton({
  isEditing,
  setIsEditing,
  fetcher,
}: {
  isEditing: boolean
  setIsEditing: (editing: boolean) => void
  fetcher: FetcherWithComponents<unknown>
}) {
  function RenderButton({
    type,
    buttonType,
    disabled,
    onClick,
    children,
    testId,
  }: {
    type?: "green" | "gray"
    buttonType: "button" | "submit"
    disabled?: boolean
    onClick?: () => void
    children: React.ReactNode
    testId?: string
  }) {
    return (
      <button
        type={buttonType}
        className={style.form.button(type ? { type } : undefined)}
        disabled={disabled}
        onClick={onClick}
        data-testid={testId}
      >
        {children}
      </button>
    )
  }

  const isBusy = fetcher.state !== "idle"
  const submitLabel: string = isBusy ? "通信中" : "保存"

  return (
    <div className="flex gap-2" data-testid="state-button-container">
      {isEditing ? (
        <>
          <RenderButton
            type="green"
            buttonType="submit"
            disabled={isBusy}
            testId="state-button-submit"
          >
            {submitLabel}
          </RenderButton>
          <RenderButton
            type="gray"
            buttonType="button"
            disabled={isBusy}
            onClick={() => setIsEditing(false)}
            testId="state-button-cancel"
          >
            キャンセル
          </RenderButton>
        </>
      ) : (
        <RenderButton
          buttonType="button"
          onClick={() => setIsEditing(true)}
          testId="state-button-edit"
        >
          編集
        </RenderButton>
      )}
    </div>
  )
}
