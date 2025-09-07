import { SignedIn, useClerk } from "@clerk/react-router"
import { Link } from "react-router"

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogHeader,
  AlertDialogFooter,
} from "~/components/ui/alert-dialog"
import { Button } from "~/components/ui/button"
import { Icon } from "~/components/ui/Icon"
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
    <div className="m-0 p-0" data-testid="account-ui-container">
      <SignedIn>
        {user && (
          <Link
            className={style.header.clerk.name()}
            to="/account"
            data-testid="account-ui-profile-link"
          >
            <img
              src={user.imageUrl}
              alt={`Profile picture of ${user.firstName} ${user.lastName}`}
              className={style.header.clerk.icon()}
              loading="lazy"
              data-testid="account-ui-profile-image"
            />
            <span
              className="text-slate-800 dark:text-slate-200"
              data-testid="account-ui-profile-name"
            >
              {user.lastName} {user.firstName}
            </span>
          </Link>
        )}
        <hr
          className="my-2 border-slate-200 dark:border-slate-700"
          data-testid="account-ui-divider-top"
        />
        {apps.map(app => (
          <div
            className="flex flex-col"
            key={app.href}
            data-testid={`account-ui-nav-item-${app.href.replace(/\//g, "-")}`}
          >
            <Link
              className={style.header.link()}
              to={app.href}
              data-testid={`account-ui-nav-link-${app.href.replace(/\//g, "-")}`}
            >
              {app.name}
            </Link>
          </div>
        ))}
        <hr data-testid="account-ui-divider-bottom" />

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button aria-label="サインアウト" data-testid="account-ui-button-signout">
              <span
                className="flex flex-row items-center justify-center"
                data-testid="account-ui-signout-content"
              >
                サインアウト
                <Icon icon="sign-out" />
              </span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>サインアウトしてもよろしいですか?</AlertDialogTitle>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>キャンセル</AlertDialogCancel>
              <AlertDialogAction
                onClick={async e => {
                  e.preventDefault()
                  await signOut()
                  window.location.reload()
                }}
              >
                サインアウト
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SignedIn>
    </div>
  )
}
