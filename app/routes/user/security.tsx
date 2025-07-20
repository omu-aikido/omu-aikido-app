import { useUser } from "@clerk/react-router"
import { useState } from "react"

import type { Route } from "./+types/security"

import { style } from "~/styles/component"

// MARK: Loader - 親のレイアウトで認証チェック済み
export async function loader(_args: Route.LoaderArgs) {
  // 認証チェックは親のレイアウトで実施済み
  return {}
}

// MARK: Meta
export function meta({}: Route.MetaArgs) {
  return [
    { title: "パスワード | プロフィール | ハム大合気ポータル" },
    { name: "description", content: "アカウントのパスワードの変更" },
  ]
}

// MARK: Component
export default function SecurityPage() {
  const { isLoaded, isSignedIn, user } = useUser()
  const [isEditing, setIsEditing] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const [visible, setVisible] = useState(false)

  const toggleVisibility = () => {
    setVisible(v => !v)
  }

  if (!isLoaded) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse bg-gray-200 h-4 w-3/4 rounded" />
        <div className="animate-pulse bg-gray-200 h-20 w-full rounded" />
      </div>
    )
  }

  if (!isSignedIn) {
    return <p>認証されていません</p>
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("すべての項目を入力してください。")
      return
    }
    if (newPassword !== confirmPassword) {
      setError("新しいパスワードが一致しません。")
      return
    }
    setLoading(true)
    try {
      await user.updatePassword({
        currentPassword,
        newPassword,
      })
      setSuccess("パスワードが変更されました。")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err: unknown) {
      if (err && typeof err === "object" && "message" in err) {
        setError(String((err as { message?: string }).message) || "パスワード変更に失敗しました。")
      } else {
        setError("パスワード変更に失敗しました。")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {!isEditing ? (
        <>
          <label className="block mb-1 font-medium">現在のパスワード</label>
          <input
            type="password"
            className={style.form.input({ disabled: true })}
            value="*****************"
            onChange={e => setCurrentPassword(e.target.value)}
            required
            disabled
          />
          <button type="button" className={style.form.button()} onClick={() => setIsEditing(true)}>
            パスワードを変更
          </button>
        </>
      ) : (
        <form onSubmit={handlePasswordUpdate} className={style.form.container()}>
          <div>
            <label className={style.form.label()}>現在のパスワード</label>
            <input
              type={visible ? "text" : "password"}
              className={style.form.input()}
              value={currentPassword}
              autoComplete="current-password"
              name="current-password"
              onChange={e => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label className={style.form.label()}>新規パスワード</label>
            <input
              type={visible ? "text" : "password"}
              className={style.form.input()}
              value={newPassword}
              autoComplete="new-password"
              name="new-password"
              onChange={e => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label className={style.form.label()}>確認</label>
            <input
              type={visible ? "text" : "password"}
              className={style.form.input()}
              value={confirmPassword}
              autoComplete="new-password"
              name="new-password-confirm"
              onChange={e => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className={style.text.error()}>{error}</div>}
          {success && <div className={style.text.success()}>{success}</div>}
          <button type="button" onClick={toggleVisibility} className={style.text.info()}>
            {visible ? "🙈" : "👁️"} パスワードを表示する
          </button>
          <div className="flex gap-2">
            <button
              type="submit"
              className={style.form.button({ disabled: loading, type: "green" })}
              disabled={loading}
            >
              {loading ? "変更中..." : "保存"}
            </button>
            <button
              type="button"
              className={style.form.button({ disabled: loading, type: "gray" })}
              disabled={loading}
              onClick={() => {
                setIsEditing(false)
                setError("")
                setSuccess("")
                setCurrentPassword("")
                setNewPassword("")
                setConfirmPassword("")
              }}
            >
              キャンセル
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
