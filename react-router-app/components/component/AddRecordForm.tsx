// 新API対応版 AddRecordForm.tsx
import React, { useState, useEffect } from "react"

interface AddRecordFormProps {
  initialDate?: string
  initialPeriod?: string
}

interface ApiResponse {
  success: boolean
  error?: string
}

interface ProfileResponse {
  success?: boolean
  profile?: { id: string }
}

const getUrlParams = () => {
  const urlParams = new URLSearchParams(window.location.search)
  return {
    date: urlParams.get("date"),
    period: urlParams.get("period"),
    error: urlParams.get("error"),
  }
}

const AddRecordForm: React.FC<AddRecordFormProps> = ({ initialDate, initialPeriod }) => {
  const urlParams = getUrlParams()

  const [date, setDate] = useState(urlParams.date || initialDate || "")
  const [period, setPeriod] = useState(urlParams.period || initialPeriod || "")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(
    urlParams.error
      ? urlParams.error === "network_error"
        ? "ネットワークエラーが発生しました。"
        : `APIエラー: ${urlParams.error}`
      : null,
  )
  const [success, setSuccess] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    // 認証済みユーザーのIDを取得
    fetch("/api/user/profile")
      .then((res) => res.json() as Promise<ProfileResponse>)
      .then((data) => {
        if (data?.success && data?.profile?.id) setUserId(data.profile.id)
        else setError("ユーザー情報の取得に失敗しました。")
      })
      .catch(() => setError("ユーザー情報の取得に失敗しました。"))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    if (!userId) {
      setError("ユーザー情報が取得できません。")
      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/me/activities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: date,
          period: parseInt(period),
          userId,
        }),
      })

      const result = (await response.json()) as ApiResponse

      if (response.ok && result.success) {
        setSuccess(true)
        window.location.href = "/apps/record"
      } else {
        setError(result.error || "記録の追加に失敗しました。")
      }
    } catch (err) {
      setError("ネットワークエラーが発生しました。")
      console.error("フェッチエラー:", err)
    } finally {
      setLoading(false)
    }
  }

  const parsedDate = date ? new Date(date) : null
  const parsedPeriod = period ? parseInt(period) : null
  const isValidParams = parsedDate && parsedPeriod

  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      {isValidParams ? (
        <>
          <h1 className="text-2xl font-bold">自動記録</h1>
          <p className="text-slate-500">以下の内容で記録を追加しますか？</p>
          <div className="mt-4">
            <p>日付: {parsedDate?.toLocaleDateString("ja-JP")}</p>
            <p>稽古時間: {parsedPeriod}時間</p>
          </div>
          <form onSubmit={handleSubmit} className="mt-4">
            <input type="hidden" name="date" value={date} />
            <input type="hidden" name="period" value={period} />
            <button
              type="submit"
              className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
              disabled={loading}
            >
              {loading ? "記録中..." : "記録する"}
            </button>
          </form>
          {error && <p className="text-red-500 mt-2">{error}</p>}
          {success && <p className="text-green-500 mt-2">記録が追加されました！</p>}
        </>
      ) : (
        <>
          <h1 className="text-2xl font-bold">エラー</h1>
          <p className="text-red-500">不正なパラメータです。</p>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </>
      )}
    </div>
  )
}

export default AddRecordForm
