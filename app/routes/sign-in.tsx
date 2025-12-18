import { useSignIn } from "@clerk/react-router"
import { getAuth } from "@clerk/react-router/server"
import { getLogger } from "@logtape/logtape"
import * as React from "react"
import { Link, redirect, useFetcher, useNavigate } from "react-router"
const logger = getLogger("routes/sign-in")

import type { Route } from "./+types/sign-in"

import { Button } from "~/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
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
    <Card
      className={style.card.container({ class: "mx-auto max-w-md" })}
      data-testid="sign-in-container"
    >
      <CardHeader>
        <CardTitle className="text-2xl">サインイン</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-6">
          <fetcher.Form method="post" onSubmit={handleSubmit} data-testid="sign-in-form">
            <div className="grid gap-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                name="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="example@mail.com"
                data-testid="sign-in-input-email"
              />
            </div>
            <div className="mt-4 grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">パスワード</Label>
                <a
                  href="https://accounts.omu-aikido.com/sign-in/"
                  className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                >
                  パスーワードを忘れた
                </a>
              </div>
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
                  <Button variant="link" className="p-0">
                    <Link
                      to="https://accounts.omu-aikido.com"
                      data-testid="sign-in-link-external"
                      className="underline"
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
              className="mt-4 w-full cursor-pointer"
              data-testid="sign-in-button-submit"
            >
              {loading ? "サインイン中..." : "サインイン"}
            </Button>
          </fetcher.Form>
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
        </div>
        <hr />
        <div className="mt-4 text-center text-sm">
          まだアカウントがありませんか?{" "}
          <Link
            to="/sign-up"
            data-testid="sign-in-link-signup"
            className="underline underline-offset-4"
          >
            サインアップ
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
