import { useUser } from "@clerk/react-router"
import { getAuth } from "@clerk/react-router/ssr.server"
import { useState } from "react"
import { redirect } from "react-router"

import type { Route } from "./+types/account"

import { NavigationTab } from "~/components/ui/NavigationTab"

export async function loader(args: Route.LoaderArgs) {
  const { userId } = await getAuth(args)
  if (!userId) return redirect("/sign-in?redirect_url=" + args.request.url)
}

export default function ProfileForm() {
  const { isLoaded, isSignedIn, user } = useUser()
  const [isEditing, setIsEditing] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)

  const tab = [
    { to: "/account", label: "プロフィール" },
    { to: "/account/status", label: "ステータス" },
    { to: "/account/security", label: "セキュリティ" },
  ]

  if (!isLoaded) {
    return (
      <div className="max-w-lg mx-auto p-4">
        <h1 className="text-xl font-bold mb-4">アカウント</h1>
        <NavigationTab tabs={tab} />
        <div className="flex items-center justify-center h-32 text-gray-500">
          <span className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500 mr-3" />
          loading...
        </div>
      </div>
    )
  }

  if (!isSignedIn) {
    return (
      <div className="max-w-lg mx-auto p-4">
        <h1 className="text-xl font-bold mb-4">アカウント</h1>
        <NavigationTab tabs={tab} />
        <p>NOT Authorized</p>
      </div>
    )
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
    <div className="max-w-lg mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">アカウント</h1>
      <NavigationTab tabs={tab} />
      {!isEditing ? (
        <>
          <button
            type="button"
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={() => setIsEditing(true)}
          >
            パスワードを変更
          </button>
        </>
      ) : (
        <form onSubmit={handlePasswordUpdate} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">現在のパスワード</label>
            <input
              type="password"
              className="w-full border rounded px-3 py-2"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">新規パスワード</label>
            <input
              type="password"
              className="w-full border rounded px-3 py-2"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">確認</label>
            <input
              type="password"
              className="w-full border rounded px-3 py-2"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="text-red-500">{error}</div>}
          {success && <div className="text-green-500">{success}</div>}
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "変更中..." : "保存"}
            </button>
            <button
              type="button"
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded"
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
