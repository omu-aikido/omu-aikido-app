import { createClerkClient } from "@clerk/react-router/api.server"
import { getAuth } from "@clerk/react-router/ssr.server"
import { useEffect, useState } from "react"
import { Link, redirect, useFetcher, useOutletContext } from "react-router"

import type { Route } from "./+types/account"

import { StateButton } from "~/components/ui/StateButton"
import type { UserLayoutComponentProps } from "~/layout/user"
import { style } from "~/styles/component"

// MARK: Meta
export function meta({}: Route.MetaArgs) {
  return [
    { title: "プロフィール | ハム大合気ポータル" },
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
export default function ProfileForm() {
  const fetcher = useFetcher()

  const context = useOutletContext<UserLayoutComponentProps>()
  const user = context.loaderData.user
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (fetcher.data) setIsEditing(false)
  }, [fetcher.data])

  const disabled = !isEditing || fetcher.state !== "idle"
  const FormWrapper = isEditing ? fetcher.Form : "form"

  return (
    <>
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
        <UsernameInput username={user.username || ""} disabled={disabled} />
        <EmailInput
          email={user.emailAddresses?.[0]?.emailAddress || ""}
          disabled={disabled}
        />
        <StateButton
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          fetcher={fetcher}
        />
      </FormWrapper>
      <p className="mt-4">
        <Link to="/account/discord" className={style.text.link()}>
          Discordアカウント連携
        </Link>
        <span className="mx-2">&nbsp;</span>
        <Link to="/account/security" className={style.text.link()}>
          パスワードの変更
        </Link>
      </p>
    </>
  )
}

// MARK: Form Field Components
function ProfileImageInput({
  imageUrl,
  isEditing,
}: {
  imageUrl: string
  isEditing: boolean
}) {
  // Only allow http(s) URLs or data URLs for images
  const safeImageUrl =
    typeof imageUrl === "string" &&
    (/^https?:\/\/[^ "]+$/.test(imageUrl) || /^data:image\//.test(imageUrl))
      ? imageUrl
      : ""

  return (
    <div className="flex gap-2 items-center">
      <div className="w-12 h-12 mr-4 rounded-full relative group overflow-hidden flex-shrink-0">
        <img
          src={safeImageUrl}
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
  // Sanitize the lastName to prevent XSS
  const safeLastName = typeof lastName === "string" ? lastName.replace(/[<>]/g, "") : ""
  return (
    <div className="w-1/2">
      <label htmlFor="lastName" className={style.form.label({ necessary: true })}>
        姓
      </label>
      <input
        type="text"
        name="lastName"
        id="lastName"
        defaultValue={safeLastName}
        required
        className={style.form.input({ disabled })}
        disabled={disabled}
      />
    </div>
  )
}

function FirstNameInput({
  firstName,
  disabled,
}: {
  firstName?: string
  disabled: boolean
}) {
  // Sanitize the firstName to prevent XSS
  const safeFirstName =
    typeof firstName === "string" ? firstName.replace(/[<>]/g, "") : ""
  return (
    <div className="w-1/2">
      <label htmlFor="firstName" className={style.form.label({ necessary: true })}>
        名
      </label>
      <input
        type="text"
        name="firstName"
        id="firstName"
        defaultValue={safeFirstName}
        required
        className={style.form.input({ disabled })}
        disabled={disabled}
      />
    </div>
  )
}

function UsernameInput({ username, disabled }: { username: string; disabled: boolean }) {
  // Sanitize the username to prevent XSS
  const safeUsername = typeof username === "string" ? username.replace(/[<>]/g, "") : ""
  return (
    <div>
      <label htmlFor="username" className={style.form.label()}>
        ユーザー名
      </label>
      <input
        type="text"
        name="username"
        id="username"
        defaultValue={safeUsername}
        className={style.form.input({ disabled })}
        disabled={disabled}
      />
    </div>
  )
}

function EmailInput({ email, disabled }: { email: string; disabled: boolean }) {
  // Sanitize the email to prevent XSS
  const safeEmail = typeof email === "string" ? email.replace(/[<>]/g, "") : ""
  return (
    <div>
      <label htmlFor="email" className={style.form.label({ necessary: true })}>
        メールアドレス
      </label>
      <input
        type="email"
        name="email"
        id="email"
        defaultValue={safeEmail}
        required
        className={style.form.input({ disabled })}
        disabled={disabled}
      />
    </div>
  )
}
