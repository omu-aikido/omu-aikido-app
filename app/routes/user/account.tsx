import { createClerkClient } from "@clerk/react-router/api.server"
import { getAuth } from "@clerk/react-router/ssr.server"
import { useEffect, useState } from "react"
import { redirect, useFetcher } from "react-router"

import type { Route } from "./+types/account"

import { NavigationTab } from "~/components/ui/NavigationTab"
import { style } from "~/styles/component"

// MARK: Loader
export async function loader(args: Route.LoaderArgs) {
  const { userId } = await getAuth(args)
  if (!userId) {
    return redirect("/sign-in?redirect_url=" + args.request.url)
  }
  const clerkClient = createClerkClient({
    secretKey: args.context.cloudflare.env.CLERK_SECRET_KEY,
  })
  const user = await clerkClient.users.getUser(userId)
  const email = user.emailAddresses?.[0]?.emailAddress || ""
  const discordAccount = user.externalAccounts?.find(acc => acc.provider === "discord")
  const username = user.username || ""
  return {
    user,
    email,
    discordAccount,
    username,
  }
}

// MARK: Meta
export function meta({}: Route.MetaArgs) {
  return [
    { title: "アカウント | プロフィール | ハム大合気ポータル" },
    { name: "description", content: "アカウントのアカウント設定" },
  ]
}

// MARK: Action
export async function action(args: Route.ActionArgs) {
  const { userId } = await getAuth(args)
  if (!userId) {
    return redirect("/sign-in?redirect_url=" + args.request.url)
  }
  const formData = await args.request.formData()
  const lastName = formData.get("lastName")?.toString()
  const firstName = formData.get("firstName")?.toString()
  const username = formData.get("username")?.toString()
  const email = formData.get("email")?.toString()
  const imageFile = formData.get("profileImage")
  const client = createClerkClient({
    secretKey: args.context.cloudflare.env.CLERK_SECRET_KEY,
  })
  const params: Partial<{
    firstName: string
    lastName: string
    emailAddress: string
    username: string
  }> = {}
  if (firstName) params.firstName = firstName
  if (lastName) params.lastName = lastName
  if (username) params.username = username
  if (email) params.emailAddress = email
  await client.users.updateUser(userId, params)
  if (imageFile && typeof imageFile !== "string") {
    await client.users.updateUserProfileImage(userId, { file: imageFile })
  }
  const user = await client.users.getUser(userId)
  return user
}

// MARK: Component
export default function ProfileForm({ loaderData }: Route.ComponentProps) {
  const fetcher = useFetcher()
  const user = loaderData.user
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (fetcher.data) setIsEditing(false)
  }, [fetcher.data])

  const tab = [
    { to: "/account", label: "プロフィール" },
    { to: "/account/status", label: "ステータス" },
    { to: "/account/security", label: "セキュリティ" },
  ]

  const FormWrapper = isEditing ? fetcher.Form : "form"
  const disabled = !isEditing || fetcher.state !== "idle"

  return (
    <div className="max-w-lg mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">アカウント</h1>
      <NavigationTab tabs={tab} />
      <FormWrapper
        method="post"
        className={style.form.container()}
        encType={isEditing ? "multipart/form-data" : undefined}
      >
        <div className="flex gap-2">
          <ProfileImageInput imageUrl={user.imageUrl} isEditing={isEditing} />
          <LastNameInput lastName={user.lastName ?? undefined} disabled={disabled} />
          <FirstNameInput firstName={user.firstName ?? undefined} disabled={disabled} />
        </div>
        <UsernameInput username={loaderData.username} disabled={disabled} />
        <EmailInput email={loaderData.email} disabled={disabled} />
        <div className="flex gap-x-2">
          {isEditing ? (
            <>
              <button
                type="submit"
                className={style.form.button({
                  disabled: fetcher.state !== "idle",
                  type: "green",
                })}
                disabled={fetcher.state !== "idle"}
              >
                {fetcher.state !== "idle" ? "通信中……" : "保存"}
              </button>
              <button
                type="button"
                className={style.form.button({
                  disabled: fetcher.state !== "idle",
                  type: "gray",
                })}
                disabled={fetcher.state !== "idle"}
                onClick={() => setIsEditing(false)}
              >
                キャンセル
              </button>
            </>
          ) : (
            <button
              type="button"
              className={style.form.button()}
              onClick={() => setIsEditing(true)}
            >
              編集
            </button>
          )}
        </div>
      </FormWrapper>
    </div>
  )
}

// MARK: Form Field Components
function ProfileImageInput({ imageUrl, isEditing }: { imageUrl: string; isEditing: boolean }) {
  return (
    <div className="flex gap-2 items-center">
      <div className="w-12 h-12 mr-4 rounded-full relative group overflow-hidden flex-shrink-0">
        <img
          src={imageUrl}
          alt="Profile"
          className="w-full h-full object-cover rounded-full aspect-square"
        />
        {isEditing && (
          <>
            <label
              htmlFor="profileImage"
              className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 opacity-50 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <span className="text-xs text-white">変更</span>
            </label>
            <input
              type="file"
              name="profileImage"
              id="profileImage"
              accept="image/*"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </>
        )}
      </div>
    </div>
  )
}

function LastNameInput({ lastName, disabled }: { lastName?: string; disabled: boolean }) {
  return (
    <div className="w-1/2">
      <label htmlFor="lastName" className={style.form.label({ necessary: true })}>
        姓
      </label>
      <input
        type="text"
        name="lastName"
        id="lastName"
        defaultValue={lastName ?? ""}
        required
        className={style.form.input({ disabled })}
        disabled={disabled}
      />
    </div>
  )
}

function FirstNameInput({ firstName, disabled }: { firstName?: string; disabled: boolean }) {
  return (
    <div className="w-1/2">
      <label htmlFor="firstName" className={style.form.label({ necessary: true })}>
        名
      </label>
      <input
        type="text"
        name="firstName"
        id="firstName"
        defaultValue={firstName ?? ""}
        required
        className={style.form.input({ disabled })}
        disabled={disabled}
      />
    </div>
  )
}

function UsernameInput({ username, disabled }: { username: string; disabled: boolean }) {
  return (
    <div>
      <label htmlFor="username" className={style.form.label()}>
        ユーザー名
      </label>
      <input
        type="text"
        name="username"
        id="username"
        defaultValue={username}
        className={style.form.input({ disabled })}
        disabled={disabled}
      />
    </div>
  )
}

function EmailInput({ email, disabled }: { email: string; disabled: boolean }) {
  return (
    <div>
      <label htmlFor="email" className={style.form.label({ necessary: true })}>
        メールアドレス
      </label>
      <input
        type="email"
        name="email"
        id="email"
        defaultValue={email}
        required
        className={style.form.input({ disabled })}
        disabled={disabled}
      />
    </div>
  )
}
