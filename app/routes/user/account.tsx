import { useState } from "react"
import { Link, useFetcher, useOutletContext } from "react-router"

import type { Route } from "./+types/account"

import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { StateButton } from "~/components/ui/StateButton"
import type { UserLayoutComponentProps } from "~/layout/user"
import { uc } from "~/lib/api-client"
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
  const formData = await args.request.formData()

  const client = uc({ request: args.request })
  const response = await client.account.$patch({
    form: formData as FormData & {
      firstName?: string
      lastName?: string
      username?: string
      profileImage?: File
    },
  })

  if (!response.ok) {
    throw new Error("Failed to update account")
  }

  return await response.json()
}

// MARK: Component
export default function ProfileForm() {
  const fetcher = useFetcher()

  const context = useOutletContext<UserLayoutComponentProps>()
  const user = context.loaderData.user
  const primaryEmail =
    user.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress ||
    user.emailAddresses[0]?.emailAddress ||
    ""
  const [isEditing, setIsEditing] = useState(false)

  // Reset editing when fetcher has data
  if (fetcher.data && isEditing) {
    setIsEditing(false)
  }

  const disabled = !isEditing || fetcher.state !== "idle"
  const FormWrapper = isEditing ? fetcher.Form : "div"

  return (
    <>
      <FormWrapper
        method="post"
        className="space-y-4"
        encType={isEditing ? "multipart/form-data" : undefined}
        data-testid="profile-form"
      >
        <div className="flex items-center gap-4">
          <ProfileImageInput imageUrl={user.imageUrl} isEditing={isEditing} />
          <div className="grid grow grid-cols-2 gap-4">
            <LastNameInput lastName={user.lastName ?? undefined} disabled={disabled} />
            <FirstNameInput firstName={user.firstName ?? undefined} disabled={disabled} />
          </div>
        </div>
        <UsernameInput username={user.username || ""} disabled={disabled} />
        <EmailInput email={primaryEmail} />
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
    (((imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) &&
      !imageUrl.includes(" ")) ||
      imageUrl.startsWith("data:image/"))
      ? imageUrl
      : ""

  return (
    <div className="flex items-center gap-2">
      <div className="group relative mr-4 h-12 w-12 shrink-0 overflow-hidden rounded-full">
        <img
          src={safeImageUrl}
          alt="Profile"
          className="aspect-square h-full w-full rounded-full object-cover"
        />
        {isEditing && (
          <>
            <label
              htmlFor="profileImage"
              className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center bg-black/40 opacity-50 transition-opacity group-hover:opacity-100"
            >
              <span className="text-xs text-white">変更</span>
            </label>
            <input
              type="file"
              name="profileImage"
              id="profileImage"
              accept="image/*"
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            />
          </>
        )}
      </div>
    </div>
  )
}

function LastNameInput({ lastName, disabled }: { lastName?: string; disabled: boolean }) {
  const safeLastName = typeof lastName === "string" ? lastName.replace(/[<]/g, "") : ""
  return (
    <div className="space-y-2">
      <Label htmlFor="lastName">姓</Label>
      <Input
        type="text"
        name="lastName"
        id="lastName"
        defaultValue={safeLastName}
        required
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
  const safeFirstName = typeof firstName === "string" ? firstName.replace(/[<]/g, "") : ""
  return (
    <div className="space-y-2">
      <Label htmlFor="firstName">名</Label>
      <Input
        type="text"
        name="firstName"
        id="firstName"
        defaultValue={safeFirstName}
        required
        disabled={disabled}
      />
    </div>
  )
}

function UsernameInput({ username, disabled }: { username: string; disabled: boolean }) {
  const safeUsername = typeof username === "string" ? username.replace(/[<]/g, "") : ""
  return (
    <div className="space-y-2">
      <Label htmlFor="username">ユーザー名</Label>
      <Input
        type="text"
        name="username"
        id="username"
        defaultValue={safeUsername}
        disabled={disabled}
      />
    </div>
  )
}

function EmailInput({ email }: { email: string }) {
  const safeEmail = typeof email === "string" ? email.replace(/[<]/g, "") : ""
  return (
    <div className="space-y-2">
      <Label>メールアドレス</Label>
      <Input value={safeEmail} readOnly disabled />
    </div>
  )
}
