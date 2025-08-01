import { SignedIn, useClerk } from "@clerk/react-router"
import { Link } from "react-router"

import { Icon } from "../ui/Icon"

import { style } from "~/styles/component"
import type { PagePath } from "~/type"

interface AccountUiProps {
  apps: PagePath[]
}

export function AccountUi({ apps }: AccountUiProps) {
  const { user, signOut } = useClerk()
  if (user instanceof Response || !user) {
    return null
  }
  return (
    <div className="m-0 p-0">
      <SignedIn>
        {user && (
          <Link className={style.header.clerk.name()} to="/account">
            <img
              src={user.imageUrl}
              alt={`Profile picture of ${user.firstName} ${user.lastName}`}
              className={style.header.clerk.icon()}
              loading="lazy"
            />
            <span className="text-slate-800 dark:text-slate-200">
              {user.lastName} {user.firstName}
            </span>
          </Link>
        )}
        <hr className="my-2 border-slate-200 dark:border-slate-700" />
        {apps.map(app => (
          <div className="flex flex-col" key={app.href}>
            <Link className={style.header.link()} to={app.href}>
              {app.name}
            </Link>
          </div>
        ))}
        <hr />

        <button
          className={style.button({ type: "secondary", className: "w-full" })}
          aria-label="サインアウト"
          onClick={async e => {
            e.preventDefault()
            if (window.confirm("サインアウトしてよろしいですか？")) {
              await signOut()
              window.location.reload()
            }
          }}
        >
          <span className="flex flex-row items-center justify-center">
            サインアウト
            <Icon icon="sign-out" />
          </span>
        </button>
      </SignedIn>
    </div>
  )
}
