import { Button } from "~/components/ui/button"

type FetcherLike = { state: "idle" | "submitting" | "loading" }

export function StateButton({
  isEditing,
  setIsEditing,
  fetcher,
}: {
  isEditing: boolean
  setIsEditing: (editing: boolean) => void
  fetcher: FetcherLike
}) {
  const isBusy = fetcher.state !== "idle"
  const submitLabel: string = isBusy ? "通信中" : "保存"

  return (
    <div className="flex gap-2" data-testid="state-button-container">
      {isEditing ? (
        <>
          <Button
            type="submit"
            variant="default"
            disabled={isBusy}
            data-testid="state-button-submit"
          >
            {submitLabel}
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={isBusy}
            onClick={() => setIsEditing(false)}
            data-testid="state-button-cancel"
          >
            キャンセル
          </Button>
        </>
      ) : (
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsEditing(true)}
          data-testid="state-button-edit"
        >
          編集
        </Button>
      )}
    </div>
  )
}
