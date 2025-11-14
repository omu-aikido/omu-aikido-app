import { getAuth } from "@clerk/react-router/ssr.server"
import { getLogger } from "@logtape/logtape"
import * as React from "react"
import { Link, redirect, useFetcher, useNavigate } from "react-router"
import { z } from "zod"

const logger = getLogger("routes/sign-in")

import type { Route } from "./+types/sign-in"

import { Button } from "~/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card"
import { Icon } from "~/components/ui/Icon"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { style } from "~/styles/component"

// MARK: Validation Schema
const signInSchema = z.object({
  email: z.email("有効なメールアドレスを入力してください"),
  password: z.string().min(8, "パスワードは8文字以上である必要があります"),
})

// MARK: ClientAction Return Type
type ClientActionReturn =
  | { success: true; sessionId: string }
  | { success: false; error: string }

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

// MARK: ClientAction
// eslint-disable-next-line react-refresh/only-export-components
export async function clientAction({
  request,
}: Route.ClientActionArgs): Promise<ClientActionReturn> {
  const formData = await request.formData()
  const data = Object.fromEntries(formData)

  // バリデーション
  const parsed = signInSchema.safeParse({
    email: data.email || "",
    password: data.password || "",
  })

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]
    return {
      success: false,
      error: firstError?.message || "入力内容をご確認ください",
    }
  }

  const { email, password } = parsed.data

  try {
    // Clerkインスタンスの取得
    const clerk = window.Clerk
    if (!clerk) {
      return {
        success: false,
        error: "認証サービスが利用できません",
      }
    }

    // サインイン処理
    const result = await clerk.client.signIn.create({
      identifier: email,
      password,
    })

    if (result.status === "complete") {
      return {
        success: true,
        sessionId: result.createdSessionId,
      }
    } else {
      return {
        success: false,
        error: "追加認証が必要です",
      }
    }
  } catch (error) {
    logger.error(`Sign-in failed: ${String(error)}`)
    return {
      success: false,
      error: "サインインに失敗しました。入力内容をご確認ください。",
    }
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
  const fetcher = useFetcher<ClientActionReturn>()
  const navigate = useNavigate()
  const [isOAuthLoading, setIsOAuthLoading] = React.useState(false)

  // clientActionの結果を処理
  React.useEffect(() => {
    if (fetcher.data && fetcher.state === "idle") {
      const result = fetcher.data

      if (result.success) {
        // セッションを有効化
        const clerk = window.Clerk
        if (clerk) {
          clerk.setActive({ session: result.sessionId }).then(() => {
            navigate("/")
          })
        }
      }
    }
  }, [fetcher.data, fetcher.state, navigate])

  const isLoading = fetcher.state === "submitting" || isOAuthLoading

  return (
    <Card
      className={style.card.container({ class: "max-w-md mx-auto" })}
      data-testid="sign-in-container"
    >
      <CardHeader>
        <CardTitle className="text-2xl">サインイン</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-6">
          <fetcher.Form method="post" data-testid="sign-in-form">
            <div className="grid gap-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                name="email"
                required
                autoComplete="email"
                placeholder="example@mail.com"
                data-testid="sign-in-input-email"
              />
            </div>
            <div className="grid gap-2 mt-4">
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
                required
                autoComplete="current-password"
                data-testid="sign-in-input-password"
              />
            </div>
            {fetcher.data && !fetcher.data.success && (
              <div data-testid="sign-in-error-container">
                <p
                  className="text-sm font-medium text-destructive mt-4"
                  data-testid="sign-in-error-message"
                >
                  {fetcher.data.error}
                </p>
                <div className="mt-4 text-sm text-slate-600 dark:text-slate-400">
                  サインインに失敗する場合は、
                  <Button variant="link" asChild className="p-0">
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
              disabled={isLoading}
              className="w-full cursor-pointer mt-4"
              data-testid="sign-in-button-submit"
            >
              {fetcher.state === "submitting" ? "サインイン中..." : "サインイン"}
            </Button>
          </fetcher.Form>
          <Button
            type="button"
            className="w-full"
            variant="outline"
            onClick={async () => {
              const clerk = window.Clerk
              if (!clerk) return
              setIsOAuthLoading(true)
              try {
                await clerk.client.signIn.authenticateWithRedirect({
                  strategy: "oauth_discord",
                  redirectUrl: "/",
                  redirectUrlComplete: "/",
                })
              } finally {
                setIsOAuthLoading(false)
              }
            }}
            disabled={isLoading}
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
