import { SignedIn, SignedOut, SignInButton, SignOutButton, useAuth } from "@clerk/astro/react"
import { style } from "@/src/styles/component"
import { getAccount } from "@/src/lib/query/profile"

interface App {
  name: string
  path: string
}

interface AccountUiProps {
  apps: App[]
}

export async function AccountUi({ apps }: AccountUiProps) {
  const auth = useAuth()
  const user = await getAccount({ userId: auth.userId })
  if (user instanceof Response) {
    return null
  }
  return (
    <div className="m-0 p-0">
      <SignedOut>
        <SignInButton mode="modal" />
      </SignedOut>
      <SignedIn>
        {user && (
          <a className={style.header.clerk.name()} href="/account">
            <img
              src={user.imageUrl}
              alt={`Profile picture of ${user.firstName} ${user.lastName}`}
              className={style.header.clerk.icon()}
              loading="lazy"
            />
            <span>
              {user.lastName} {user.firstName}
            </span>
          </a>
        )}
        <hr />
        {apps.map((app) => (
          <div className="flex flex-col" key={app.path}>
            <a className={style.header.link()} href={app.path}>
              {app.name}
            </a>
          </div>
        ))}
        <hr />
        <SignOutButton />
      </SignedIn>
    </div>
  )
}
