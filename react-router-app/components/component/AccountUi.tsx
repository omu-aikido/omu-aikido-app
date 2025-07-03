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
        <div className="[&_button]:w-full [&_button]:justify-center [&_button]:bg-blue-600 [&_button]:text-white hover:[&_button]:bg-blue-700 dark:[&_button]:bg-blue-500 dark:hover:[&_button]:bg-blue-600">
          <SignInButton mode="modal" />
        </div>
      </SignedOut>
      <SignedIn>
        {user && (
          <a
            className={`${style.header.clerk.name()} p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800`}
            href="/account"
          >
            <img
              src={user.imageUrl}
              alt={`Profile picture of ${user.firstName} ${user.lastName}`}
              className={style.header.clerk.icon()}
              loading="lazy"
            />
            <span className="text-gray-800 dark:text-gray-200">
              {user.lastName} {user.firstName}
            </span>
          </a>
        )}
        <hr className="my-2 border-gray-200 dark:border-gray-700" />
        {apps.map((app) => (
          <div className="flex flex-col" key={app.path}>
            <a
              className={`${style.header.link()} p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200`}
              href={app.path}
            >
              {app.name}
            </a>
          </div>
        ))}
      </SignedIn>
    </div>
  )
}
