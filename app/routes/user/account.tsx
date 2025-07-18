import { createClerkClient } from "@clerk/react-router/api.server"
import { getAuth } from "@clerk/react-router/ssr.server"
import { useEffect, useState } from "react"
import { redirect, useFetcher } from "react-router"

import type { Route } from "./+types/account"

import { NavigationTab } from "~/components/ui/NavigationTab"
import { style } from "~/styles/component"

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

  return (
    <div className="max-w-lg mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">アカウント</h1>
      <NavigationTab tabs={tab} />

      {isEditing ? (
        <fetcher.Form
          method="post"
          className={style.form.container()}
          encType="multipart/form-data"
        >
          <div className="flex gap-2 items-center">
            <div className="w-12 h-12 mr-4 rounded-full relative group overflow-hidden flex-shrink-0">
              <img
                src={user.imageUrl}
                alt="Profile"
                className="w-full h-full object-cover rounded-full aspect-square"
              />
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
            </div>
            <div className="w-1/2">
              <label htmlFor="lastName" className={style.form.label({ necessary: true })}>
                姓
              </label>
              <input
                type="text"
                name="lastName"
                id="lastName"
                defaultValue={user.lastName ?? ""}
                required
                className={style.form.input()}
              />
            </div>
            <div className="w-1/2">
              <label htmlFor="firstName" className={style.form.label({ necessary: true })}>
                名
              </label>
              <input
                type="text"
                name="firstName"
                id="firstName"
                defaultValue={user.firstName ?? ""}
                required
                className={style.form.input()}
              />
            </div>
          </div>
          <div>
            <label htmlFor="username" className={style.form.label()}>
              ユーザー名
            </label>
            <input
              type="text"
              name="username"
              id="username"
              defaultValue={loaderData.username}
              className={style.form.input()}
            />
          </div>
          <div>
            <label htmlFor="email" className={style.form.label({ necessary: true })}>
              メールアドレス
            </label>
            <input
              type="email"
              name="email"
              id="email"
              defaultValue={loaderData.email}
              required
              className={style.form.input()}
            />
          </div>
          <div className="flex gap-2">
            {fetcher.state !== "idle" ? (
              <span className="ml-2 text-blue-500 flex items-center">
                <svg className="animate-spin h-5 w-5 mr-1" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
                Loading...
              </span>
            ) : (
              <>
                <button
                  type="submit"
                  className={style.form.button({
                    disabled: fetcher.state !== "idle",
                    type: "green",
                  })}
                  disabled={fetcher.state !== "idle"}
                >
                  保存
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
            )}
          </div>
        </fetcher.Form>
      ) : (
        <div>
          <form className={style.form.container()}>
            <div className="flex gap-2 items-center">
              <img src={user.imageUrl} alt="Profile" className="w-12 h-12 mr-4 rounded-full" />
              <div className="w-1/2">
                <label htmlFor="lastName" className={style.form.label()}>
                  姓
                </label>
                <input
                  type="text"
                  name="lastName"
                  id="lastName"
                  defaultValue={user.lastName ?? ""}
                  disabled
                  className={style.form.input({ disabled: true })}
                />
              </div>
              <div className="w-1/2">
                <label htmlFor="firstName" className={style.form.label()}>
                  名
                </label>
                <input
                  type="text"
                  name="firstName"
                  id="firstName"
                  defaultValue={user.firstName ?? ""}
                  disabled
                  className={style.form.input({ disabled: true })}
                />
              </div>
            </div>
            <div>
              <label htmlFor="username" className={style.form.label()}>
                ユーザー名
              </label>
              <input
                type="text"
                name="username"
                id="username"
                defaultValue={loaderData.username}
                disabled
                className={style.form.input({ disabled: true })}
              />
            </div>
            <div>
              <label htmlFor="email" className={style.form.label()}>
                メールアドレス
              </label>
              <input
                type="email"
                name="email"
                id="email"
                defaultValue={loaderData.email}
                disabled
                className={style.form.input({ disabled: true })}
              />
            </div>
          </form>
          <button
            type="button"
            className={style.form.button() + " mt-4"}
            onClick={() => setIsEditing(true)}
          >
            編集
          </button>
        </div>
      )}
      <div className="mt-6">
        {/*
        <h2 className="font-semibold mb-2">Discord連携</h2>
        {loaderData.discordAccount ? (
          <div className="flex items-center gap-2">
            {loaderData.discordAccount.imageUrl ? (
              <img
                src={loaderData.discordAccount.imageUrl}
                alt="Discord"
                className="w-8 h-8 rounded-full"
              />
            ) : null}
            <span>
              {loaderData.discordAccount.username || loaderData.discordAccount.emailAddress}
            </span>
          </div>
        ) : (
          <button
            type="button"
            className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 transition"
            onClick={() => {
              window.location.href = "/auth/discord"
            }}
          >
            Discord連携する
          </button>
        )}
        */}
      </div>
    </div>
  )
}
