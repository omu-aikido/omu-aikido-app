import { useSignUp } from "@clerk/react-router"
import * as React from "react"
import { Link, useFetcher } from "react-router"

import { style } from "../styles/component"

import { Icon } from "~/components/ui/Icon"

export default function SignUpPage() {
  const { signUp, setActive, isLoaded } = useSignUp()
  const fetcher = useFetcher()
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    if (!isLoaded || !signUp || !setActive) {
      setError("認証サービスが利用できません")
      setLoading(false)
      return
    }
    try {
      const result = await signUp.create({
        emailAddress: email,
        password,
      })
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId })
        window.location.href = "/"
      } else {
        setError("追加認証が必要です。")
      }
    } catch (err) {
      let errorMsg = "サインアップに失敗しました"
      if (typeof err === "object" && err && "errors" in err) {
        errorMsg = (err as { errors?: { message?: string }[] }).errors?.[0]?.message || errorMsg
      }
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-8 bg-white dark:bg-slate-900 rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-6 text-center text-slate-900 dark:text-slate-100">
        サインアップ
      </h1>
      <fetcher.Form method="post" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 text-sm font-medium text-slate-700 dark:text-slate-200">
            メールアドレス
            <input
              type="email"
              name="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="mt-1 block w-full rounded border-slate-300 dark:border-slate-700 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:focus:border-indigo-400 px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </label>
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium text-slate-700 dark:text-slate-200">
            パスワード
            <input
              type="password"
              name="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              className="mt-1 block w-full rounded border-slate-300 dark:border-slate-700 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:focus:border-indigo-400 px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </label>
        </div>
        {error && (
          <div className="text-red-600 dark:text-red-400 mt-2 text-sm">
            サインアップに失敗しました。
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-indigo-600 dark:bg-indigo-700 text-white font-semibold rounded hover:bg-indigo-700 dark:hover:bg-indigo-800 transition disabled:opacity-50"
        >
          {loading ? "サインアップ中..." : "サインアップ"}
        </button>
      </fetcher.Form>
      <div className="my-6 border-t border-slate-200 dark:border-slate-700" />
      <button
        type="button"
        className="w-full py-2 px-4 bg-[#5865F2] dark:bg-[#4752C4] text-white font-semibold rounded flex items-center justify-center gap-2 hover:bg-[#4752C4] dark:hover:bg-[#36418C] transition disabled:opacity-50"
        onClick={async () => {
          if (!isLoaded || !signUp) return
          setLoading(true)
          try {
            await signUp.authenticateWithRedirect({
              strategy: "oauth_discord",
              redirectUrl: "/",
              redirectUrlComplete: "/",
            })
          } finally {
            setLoading(false)
          }
        }}
        disabled={loading}
      >
        <Icon icon={"discord-logo"} size="24" />
        Discordで登録
      </button>
      <div className="mt-4 text-center text-sm text-slate-600 dark:text-slate-400">
        サインアップ済みですか？
        <br />
        <span className={style.text.link()}>
          <Link to="/sign-in">こちら</Link>
        </span>
        からサインインできます。
      </div>
    </div>
  )
}
