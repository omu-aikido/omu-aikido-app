import React, { useState } from "react"

type ActivityData = {
  id: string
  date: string
  period: number
}

type EditRecordFormProps = {
  activity: ActivityData
  redirectTo: string
}

export const EditRecordForm: React.FC<EditRecordFormProps> = ({ activity, redirectTo }) => {
  const [date, setDate] = useState(new Date(activity.date).toISOString().split("T")[0])
  const [period, setPeriod] = useState<number | "">(activity.period)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [deleteLoading, setDeleteLoading] = useState(false)

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!window.confirm("このアクティビティを更新してもよろしいですか？")) return
    setLoading(true)
    setError("")
    setSuccess("")
    try {
      const res = await fetch("/api/record", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: activity.id, date, period: Number(period) }),
      })
      if (res.ok) {
        setSuccess("更新しました。リストに戻ります。")
        setTimeout(() => {
          window.location.href = redirectTo
        }, 1000)
      } else {
        const err = (await res.json()) as { message?: string }
        setError(err.message || "更新に失敗しました")
      }
    } catch (e: any) {
      setError(e.message || "更新時にエラーが発生しました")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!window.confirm("このアクティビティを削除してもよろしいですか？")) return
    setDeleteLoading(true)
    setError("")
    setSuccess("")
    try {
      const res = await fetch("/api/record", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: activity.id }),
      })
      if (res.ok) {
        setSuccess("削除しました。リストに戻ります。")
        setTimeout(() => {
          window.location.href = redirectTo
        }, 1000)
      } else {
        const err = (await res.json()) as { message?: string }
        setError(err.message || "削除に失敗しました")
      }
    } catch (e: any) {
      setError(e.message || "削除時にエラーが発生しました")
    } finally {
      setDeleteLoading(false)
    }
  }

  if (error) return <div className="text-red-600">{error}</div>

  return (
    <div className="max-w-lg mx-auto p-4 sm:p-6">
      <h1 className="text-2xl font-bold mb-6">アクティビティ編集</h1>

      {error && <div className="mb-4 text-red-600">{error}</div>}
      {success && <div className="mb-4 text-green-600">{success}</div>}

      <form
        onSubmit={handleUpdate}
        className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-4"
      >
        <div className="mb-4">
          <label
            htmlFor="date"
            className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
          >
            日付
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 transition-colors"
          />
        </div>

        <div className="mb-6">
          <label
            htmlFor="period"
            className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
          >
            稽古時間
          </label>
          <input
            type="number"
            id="period"
            name="period"
            value={period}
            step="0.5"
            onChange={(e) => setPeriod(e.target.value === "" ? "" : Number(e.target.value))}
            required
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
        >
          {loading ? "更新中..." : "更新"}
        </button>
      </form>

      <form
        onSubmit={handleDelete}
        className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-4"
      >
        <button
          type="submit"
          disabled={deleteLoading}
          className="w-full bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 text-white font-medium py-2.5 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
        >
          {deleteLoading ? "削除中..." : "削除する"}
        </button>
      </form>

      <a
        href={redirectTo}
        className="block w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium py-2.5 px-4 rounded-md text-center transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 no-underline"
      >
        キャンセル
      </a>
    </div>
  )
}

export default EditRecordForm
