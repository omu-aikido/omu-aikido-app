import { useUser } from "@clerk/react-router"
import { useState } from "react"

import type { Route } from "./+types/security"

import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"

// MARK: Meta
export function meta({}: Route.MetaArgs) {
  return [
    { title: "パスワード変更 | ハム大合気ポータル" },
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
        <div className="h-4 w-3/4 animate-pulse rounded-sm bg-gray-200" />
        <div className="h-20 w-full animate-pulse rounded-sm bg-gray-200" />
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
      await user.updatePassword({ currentPassword, newPassword })
      setSuccess("パスワードが変更されました。")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err: unknown) {
      if (err && typeof err === "object" && "message" in err) {
        setError(
          String((err as { message?: string }).message) ||
            "パスワード変更に失敗しました。",
        )
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
        <div className="space-y-4">
          <div>
            <Label>現在のパスワード</Label>
            <Input type="password" value="*****************" readOnly disabled />
          </div>
          <Button onClick={() => setIsEditing(true)}>パスワードを変更</Button>
        </div>
      ) : (
        <form onSubmit={handlePasswordUpdate} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">現在のパスワード</Label>
            <Input
              type={visible ? "text" : "password"}
              id="current-password"
              value={currentPassword}
              autoComplete="current-password"
              name="current-password"
              onChange={e => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">新規パスワード</Label>
            <Input
              type={visible ? "text" : "password"}
              id="new-password"
              value={newPassword}
              autoComplete="new-password"
              name="new-password"
              onChange={e => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password-confirm">確認</Label>
            <Input
              type={visible ? "text" : "password"}
              id="new-password-confirm"
              value={confirmPassword}
              autoComplete="new-password"
              name="new-password-confirm"
              onChange={e => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-sm font-medium text-destructive">{error}</p>}
          {success && <p className="text-sm font-medium text-green-600">{success}</p>}
          <Button type="button" variant="ghost" onClick={toggleVisibility}>
            {visible ? "🙈" : "👁️"} パスワードを表示する
          </Button>
          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? "変更中..." : "保存"}
            </Button>
            <Button
              type="button"
              variant="secondary"
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
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
