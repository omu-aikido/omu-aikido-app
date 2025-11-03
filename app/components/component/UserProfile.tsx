import type { ExternalAccount, User } from "@clerk/react-router/ssr.server"
import { tv } from "tailwind-variants"

import { Icon } from "~/components/ui/Icon"
import { Role } from "~/lib/zod"
import type { Profile } from "~/type"

interface UserProfileSectionProps {
  user: User
  unSafeprofile: Profile | null
  profile: Profile
  discord?: ExternalAccount
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
        className="inline-block px-3 py-1 mb-2 rounded-full bg-red-100 text-red-700 text-xs font-bold"
        data-testid="user-profile-status-badge"
      >
        プロフィール未設定
      </span>
    )
  }

  return (
    <div className={card({ className: "p-6 mb-3" })} data-testid="user-profile-container">
      {/* ステータスバッジ表示 */}
      {statusBadge}
      <div className="flex items-center gap-4 mb-6" data-testid="user-profile-header">
        <img
          src={user.imageUrl}
          alt={`${user.lastName ?? ""} ${user.firstName ?? ""}`}
          className="w-16 h-16 rounded-full object-cover border-4 border-slate-200 dark:border-slate-600"
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
              className="text-slate-600 dark:text-slate-400 flex flex-row items-center text-sm"
              data-testid="user-profile-discord"
            >
              <Icon icon="discord-logo" className="m-0! mr-2!" />
              {discord.username}
            </p>
          )}
          <p
            className="text-slate-600 dark:text-slate-400 flex flex-row items-center text-sm"
            data-testid="user-profile-email"
          >
            <Icon icon="envelope" className="m-0! mr-2!" />
            {user.emailAddresses[0]?.emailAddress || "未設定"}
          </p>
        </div>
      </div>
      <div>
        <div className="space-y-3 flex flex-col" data-testid="user-profile-details">
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
  base: "bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700",
})

const info = tv({
  slots: {
    frame: "flex flex-row",
    label: "block text-sm font-medium text-slate-700 dark:text-slate-300",
    value:
      "ml-auto items-end justify-center text-sm text-slate-900 dark:text-slate-100 font-mono",
  },
})
