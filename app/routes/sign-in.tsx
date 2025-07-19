import { useSignIn } from "@clerk/react-router"
import { getAuth } from "@clerk/react-router/ssr.server"
import * as React from "react"
import { Link, redirect, useFetcher } from "react-router"

import { style } from "../styles/component"

import type { Route } from "./+types/sign-in"

import { Icon } from "~/components/ui/Icon"

// MARK: Loader
export async function loader(args: Route.LoaderArgs) {
  const auth = await getAuth(args)
  const userId = auth.userId

  if (userId) return redirect(new URL(args.request.url).searchParams.get("redirect_url") ?? "/")
}

// MARK: Meta
export function meta() {
  return [
    { title: "サインイン | ハム大合気ポータル" },
    { name: "description", content: "サインインページ" },
  ]
}

// MARK: Component
export default function SignInPage() {
  const { signIn, setActive, isLoaded } = useSignIn()
  const fetcher = useFetcher()
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    if (!isLoaded || !signIn || !setActive) {
      setError("認証サービスが利用できません")
      setLoading(false)
      return
    }
    try {
      const result = await signIn.create({
        identifier: email,
        password,
      })
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId })
        window.location.href = "/"
      } else {
        setError("追加認証が必要です。")
      }
    } catch (err) {
      let errorMsg = "サインインに失敗しました"
      if (typeof err === "object" && err && "errors" in err) {
        errorMsg = (err as { errors?: { message?: string }[] }).errors?.[0]?.message || errorMsg
      }
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={style.card.container({ class: "max-w-md mx-auto" })}>
      <h1 className={style.text.sectionTitle()}>サインイン</h1>
      <fetcher.Form method="post" onSubmit={handleSubmit} className={style.form.container()}>
        <div>
          <label htmlFor="email" className={style.form.label({ necessary: true })}>
            メールアドレス
          </label>
          <input
            id="email"
            type="email"
            name="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoComplete="email"
            className={style.form.input()}
          />
        </div>
        <div>
          <label htmlFor="password" className={style.form.label({ necessary: true })}>
            パスワード
          </label>
          <input
            id="password"
            type="password"
            name="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className={style.form.input()}
          />
        </div>
        {error && (
          <div className={style.text.error()}>
            メールアドレスまたはパスワードが正しくありません。
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className={style.button.default({ type: "primary", disabled: loading, class: "w-full" })}
        >
          {loading ? "サインイン中..." : "サインイン"}
        </button>
      </fetcher.Form>
      <div className="my-6 border-t border-slate-200 dark:border-slate-700" />
      <button
        type="button"
        className="w-full py-2 px-4 bg-[#5865F2] dark:bg-[#4752C4] text-white font-semibold rounded flex items-center justify-center gap-2 hover:bg-[#4752C4] dark:hover:bg-[#36418C] transition disabled:opacity-50"
        onClick={async () => {
          if (!isLoaded || !signIn) return
          setLoading(true)
          try {
            await signIn.authenticateWithRedirect({
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
        Discordで認証
      </button>
      <div className="mt-4 text-center text-sm text-slate-600 dark:text-slate-400">
        まだアカウントがありませんか？
        <br />
        <span className={style.text.link()}>
          <Link to="/sign-up">こちら</Link>
        </span>
        からサインアップしてください。
      </div>
    </div>
  )
}
