import type { ApiExternalAccount, ApiUser } from "@/type/api-user"
import { tv } from "tailwind-variants"

import { Icon } from "@/app/components/ui/Icon"
import { Role } from "@/app/lib/role"
import type { Profile } from "@/app/type"

interface UserProfileSectionProps {
  user: ApiUser
  unSafeprofile: Profile | null
  profile: Profile
  discord?: ApiExternalAccount
}
export function UserProfileSection({
  user,
  unSafeprofile,
  profile,
  discord,
}: UserProfileSectionProps) {
  // 不足データ判定
  let statusBadge: React.ReactNode = null
  if (!unSafeprofile) {
    statusBadge = (
      <span
        className="mb-2 inline-block rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700"
        data-testid="user-profile-status-badge"
      >
        プロフィール未設定
      </span>
    )
  }

  return (
    <div className={card({ className: "mb-3 p-6" })} data-testid="user-profile-container">
      {/* ステータスバッジ表示 */}
      {statusBadge}
      <div className="mb-6 flex items-center gap-4" data-testid="user-profile-header">
        <img
          src={user.imageUrl}
          alt={`${user.lastName ?? ""} ${user.firstName ?? ""}`}
          className="h-16 w-16 rounded-full border-4 border-slate-200 object-cover dark:border-slate-600"
          data-testid="user-profile-avatar"
        />
        <div>
          <h2
            className="text-xl font-semibold text-slate-900 dark:text-slate-100"
            data-testid="user-profile-name"
          >
            {user.lastName ?? ""} {user.firstName ?? ""}
          </h2>
          {discord && discord.username && (
            <p
              className="flex flex-row items-center text-sm text-slate-600 dark:text-slate-400"
              data-testid="user-profile-discord"
            >
              <Icon icon="discord-logo" className="m-0! mr-2!" />
              {discord.username}
            </p>
          )}
          <p
            className="flex flex-row items-center text-sm text-slate-600 dark:text-slate-400"
            data-testid="user-profile-email"
          >
            <Icon icon="envelope" className="m-0! mr-2!" />
            {user.emailAddresses[0]?.emailAddress || "未設定"}
          </p>
        </div>
      </div>
      <div>
        <div className="flex flex-col space-y-3" data-testid="user-profile-details">
          <div className={info().frame()} data-testid="user-profile-role">
            <label className={info().label()}>役職</label>
            <p className={info().value()}>
              {Role.fromString(profile?.role)?.ja || "部員"}
            </p>
          </div>
          <div className={info().frame()} data-testid="user-profile-created">
            <label className={info().label()}>作成日</label>
            <p className={info().value()}>
              {user.createdAt ? new Date(user.createdAt).toLocaleString("ja-JP") : "-"}
            </p>
          </div>
          <div className={info().frame()} data-testid="user-profile-updated">
            <label className={info().label()}>最終更新日</label>
            <p className={info().value()}>
              {user.updatedAt ? new Date(user.updatedAt).toLocaleString("ja-JP") : "-"}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

const card = tv({
  base: "rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800",
})

const info = tv({
  slots: {
    frame: "flex flex-row",
    label: "block text-sm font-medium text-slate-700 dark:text-slate-300",
    value:
      "ml-auto items-end justify-center font-mono text-sm text-slate-900 dark:text-slate-100",
  },
})
