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
  }: {
    type?: "green" | "gray"
    buttonType: "button" | "submit"
    disabled?: boolean
    onClick?: () => void
    children: React.ReactNode
  }) {
    return (
      <button
        type={buttonType}
        className={style.form.button(type ? { type } : undefined)}
        disabled={disabled}
        onClick={onClick}
      >
        {children}
      </button>
    )
  }

  const isBusy = fetcher.state !== "idle"
  const submitLabel: string = isBusy ? "通信中" : "保存"

  return (
    <div className="flex gap-2">
      {isEditing ? (
        <>
          <RenderButton type="green" buttonType="submit" disabled={isBusy}>
            {submitLabel}
          </RenderButton>
          <RenderButton
            type="gray"
            buttonType="button"
            disabled={isBusy}
            onClick={() => setIsEditing(false)}
          >
            キャンセル
          </RenderButton>
        </>
      ) : (
        <RenderButton buttonType="button" onClick={() => setIsEditing(true)}>
          編集
        </RenderButton>
      )}
    </div>
  )
}
