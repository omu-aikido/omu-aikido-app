import { useSignIn } from "@clerk/react-router"
import { getAuth } from "@clerk/react-router/ssr.server"
import { getLogger } from "@logtape/logtape"
import * as React from "react"
import { Link, redirect, useFetcher, useNavigate } from "react-router"
const logger = getLogger("routes/sign-in")

import type { Route } from "./+types/sign-in"

import { Button } from "~/components/ui/button"
import { Icon } from "~/components/ui/Icon"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { style } from "~/styles/component"

// MARK: Loader
export async function loader(args: Route.LoaderArgs) {
  const auth = await getAuth(args)
  const authenticated = auth.isAuthenticated

  if (authenticated) {
    const url = new URL(args.request.url)
    let safeRedirectUrl = "/"

    const redirectUrl = url.searchParams.get("redirect_url")
    if (redirectUrl) {
      try {
        const parsedRedirectUrl = new URL(redirectUrl, url.origin)
        // 危険なURLスキームを削除
        const dangerousSchemes = [
          "javascript:",
          "data:",
          "vbscript:",
          "file:",
          "about:",
          "mailto:",
        ]
        for (const scheme of dangerousSchemes) {
          if (parsedRedirectUrl.href.startsWith(scheme)) {
            break
          }
        }
        if (parsedRedirectUrl.origin === url.origin) {
          safeRedirectUrl = parsedRedirectUrl.pathname
        }
      } catch (e) {
        logger.error(`Invalid redirect_url: ${String(redirectUrl)}: ${String(e)}`)
      }
    }

    return redirect(safeRedirectUrl)
  }
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
  const navigate = useNavigate()
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
      const result = await signIn.create({ identifier: email, password })
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId })
        navigate("/")
      } else {
        setError("追加認証が必要です。")
      }
    } catch {
      setError("サインインに失敗しました。入力内容をご確認ください。")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className={style.card.container({ class: "max-w-md mx-auto" })}
      data-testid="sign-in-container"
    >
      <h1 className={style.text.sectionTitle()} data-testid="sign-in-title">
        サインイン
      </h1>
      <fetcher.Form
        method="post"
        onSubmit={handleSubmit}
        className="space-y-4"
        data-testid="sign-in-form"
      >
        <div className="space-y-2">
          <Label htmlFor="email">メールアドレス</Label>
          <Input
            id="email"
            type="email"
            name="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoComplete="email"
            data-testid="sign-in-input-email"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">パスワード</Label>
          <Input
            id="password"
            type="password"
            name="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            data-testid="sign-in-input-password"
          />
        </div>
        {error && (
          <div data-testid="sign-in-error-container">
            <p
              className="text-sm font-medium text-destructive"
              data-testid="sign-in-error-message"
            >
              {error}
            </p>
            <div className="mt-4 text-sm text-slate-600 dark:text-slate-400">
              サインインに失敗する場合は、
              <Button variant="link" asChild className="p-0">
                <Link
                  to="https://accounts.omu-aikido.com"
                  data-testid="sign-in-link-external"
                >
                  こちら
                </Link>
              </Button>
              からサインインをお試しください。
            </div>
          </div>
        )}
        <Button
          type="submit"
          disabled={loading || error !== null}
          className="w-full cursor-pointer"
          data-testid="sign-in-button-submit"
        >
          {loading ? "サインイン中..." : "サインイン"}
        </Button>
      </fetcher.Form>
      <hr className="my-6" />
      <Button
        type="button"
        className="w-full"
        variant="outline"
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
        data-testid="sign-in-button-discord"
      >
        <Icon icon={"discord-logo"} size="24" className="mr-2" />
        Discordで認証
      </Button>
      <div
        className="mt-4 text-center text-sm text-slate-600 dark:text-slate-400"
        data-testid="sign-in-signup-link-container"
      >
        まだアカウントがありませんか？
        <br />
        <span className={style.text.link()}>
          <Link to="/sign-up" data-testid="sign-in-link-signup">
            こちら
          </Link>
        </span>
        からサインアップしてください。
      </div>
    </div>
  )
}
