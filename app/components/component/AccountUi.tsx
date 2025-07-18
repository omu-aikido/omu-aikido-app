import { SignedIn, SignOutButton, useClerk } from "@clerk/react-router"
import { Link } from "react-router"

import { Icon } from "../ui/Icon"

import { style } from "~/styles/component"
import type { PagePath } from "~/type"

interface AccountUiProps {
  apps: PagePath[]
}

export function AccountUi({ apps }: AccountUiProps) {
  const auth = useClerk()
  const user = auth.user
  if (user instanceof Response || !user) {
    return null
  }
  return (
    <div className="m-0 p-0">
      <SignedIn>
        {user && (
          <Link
            className={`${style.header.clerk.name()} p-2 rounded-md hover:bg-slate-300 dark:hover:bg-slate-700 `}
            to="/account"
          >
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
            <Link
              className={`${style.header.link()} p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-transparent hover:border-slate-400 dark:hover:border-slate-700`}
              to={app.href}
            >
              {app.name}
            </Link>
          </div>
        ))}
        <hr />

        <div
          className={`hover:cursor-pointer p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-transparent hover:border-slate-400 dark:hover:border-slate-500`}
          aria-label="サインアウト"
          onClick={e => {
            e.preventDefault()
            if (window.confirm("サインアウトしてよろしいですか？")) {
              const btn = document.getElementById("signout-btn")
              btn?.click()
            }
          }}
        >
          <SignOutButton>
            <span className="flex flex-row items-center">
              サインアウト
              <Icon icon="sign-out" />
            </span>
          </SignOutButton>
        </div>
      </SignedIn>
    </div>
  )
}
