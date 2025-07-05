import { useState, useCallback } from "react"
import { Notification } from "../component/Notification"
import { useAuth } from "@clerk/astro/react"
import { style } from "../../../src/styles/component"

export type ResultType = "success" | "error" | null

export const AddRecord = () => {
  const { userId, isSignedIn } = useAuth() // userIdも取得
  const [result, setResult] = useState<ResultType>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formState, setFormState] = useState({
    date: new Date().toISOString().split("T")[0],
    period: "1.5",
  })

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      setSubmitting(true)

      if (!isSignedIn || !userId) {
        // userIdもチェック
        setResult("error")
        setSubmitting(false)
        return
      }

      try {
        const response = await fetch("/api/me/activities", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: userId,
            date: formState.date,
            period: formState.period,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to add record")
        }

        setResult("success")
        // 成功時にページをリロードしてRecentsを更新
        setTimeout(() => {
          window.location.reload()
        }, 1500) // 成功メッセージを表示してからリロード
      } catch (error) {
        setResult("error")
      } finally {
        setSubmitting(false)
      }
    },
    [setSubmitting, setResult, formState.date, formState.period, userId, isSignedIn], // 依存関係を更新
  )

  return (
    <div>
      {result && (
        <Notification
          title="記録の追加"
          message={
            result === "error" ? "記録の追加が失敗しました。" : "記録が正常に追加されました。"
          }
          type={result === "error" ? "error" : "success"}
          duration={result === "error" ? 5000 : 3000}
          onClose={() => {
            setResult(null)
            setFormState({
              date: new Date().toISOString().split("T")[0],
              period: "1.5",
            })
          }}
        />
      )}

      <form noValidate onSubmit={handleSubmit} className={style.form.container({})}>
        {/* Removed hidden input with placeholder user ID */}
        <label htmlFor="dateDaypicker" className="text-sm font-medium col-span-1">
          日付<span className={style.text.necessary({})}>*</span>
        </label>
        <input
          id="dateDaypicker"
          autoComplete="off"
          type="date"
          className={style.form.input({})}
          value={formState.date}
          onChange={(e) => setFormState((prev) => ({ ...prev, date: e.target.value }))}
        />
        <label htmlFor="timeInput" className="text-sm font-medium col-span-1">
          稽古時間<span className={style.text.necessary({})}>*</span>
        </label>
        <input
          id="timeInput"
          autoComplete="off"
          step="0.5"
          type="number"
          className={style.form.input({})}
          min="1"
          max="5"
          value={formState.period}
          onChange={(e) => setFormState((prev) => ({ ...prev, period: e.target.value }))}
        />
        <button
          disabled={submitting}
          type="submit"
          id="submitAddRecord"
          className={style.form.button()}
        >
          {submitting ? "送信中..." : "追加"}
        </button>
      </form>
    </div>
  )
}
