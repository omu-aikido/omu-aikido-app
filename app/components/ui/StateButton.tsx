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
  return (
    <div className="flex gap-2">
      {isEditing ? (
        <>
          <button
            type="submit"
            className={style.form.button({
              disabled: fetcher.state !== "idle",
              type: "green",
            })}
            disabled={fetcher.state !== "idle"}
          >
            {fetcher.state !== "idle" ? "通信中" : "保存"}
          </button>
          <button
            type="button"
            className={style.form.button({
              disabled: fetcher.state !== "idle",
              type: "gray",
            })}
            disabled={fetcher.state !== "idle"}
            onClick={() => setIsEditing(false)}
          >
            キャンセル
          </button>
        </>
      ) : (
        <button
          type="button"
          className={style.form.button()}
          onClick={() => setIsEditing(true)}
        >
          編集
        </button>
      )}
    </div>
  )
}
