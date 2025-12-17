import type { User } from "@clerk/react-router/server"
import React from "react"
import { useNavigate } from "react-router"

import { Role } from "~/lib/role"
import { translateGrade, translateYear } from "~/lib/utils"

// MARK: UserListRow
export const UserListRow = React.memo<{ key: string; user: User }>(function UserListRow({
  key,
  user,
}) {
  const navigate = useNavigate()

  const handleRowClick = React.useCallback(() => {
    navigate(`/admin/user/${user.id}`)
  }, [navigate, user.id])

  return (
    <tr
      key={key}
      className="cursor-pointer transition-colors duration-200 hover:bg-slate-50 dark:hover:bg-slate-700"
      onClick={handleRowClick}
    >
      <td className="px-6 py-3 whitespace-nowrap">
        <div className="flex items-center">
          <img
            src={typeof user.imageUrl === "string" ? user.imageUrl : ""}
            alt={`${typeof user.lastName === "string" ? user.lastName : ""} ${typeof user.firstName === "string" ? user.firstName : ""}`}
            className="h-10 w-10 rounded-full border-2 border-slate-200 object-cover dark:border-slate-600"
          />
          <div className="ml-4">
            <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
              {typeof user.lastName === "string" ? user.lastName : ""}{" "}
              {typeof user.firstName === "string" ? user.firstName : ""}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          {user.publicMetadata.role && user.publicMetadata.role !== ""
            ? Role.fromString(user.publicMetadata.role as string)?.ja
            : "未設定"}
        </span>
      </td>
      <td className="px-6 py-4 text-sm whitespace-nowrap text-slate-900 dark:text-slate-100">
        {translateYear(user.publicMetadata.year as string)}
      </td>
      <td className="px-6 py-4 text-sm whitespace-nowrap text-slate-900 dark:text-slate-100">
        {translateGrade(user.publicMetadata.grade as number)}
      </td>
    </tr>
  )
})

// MARK: UserCell
export const UserCell = React.memo<{ key: string; user: User }>(function UserCell({
  key,
  user,
}) {
  const navigate = useNavigate()

  const handleCellClick = React.useCallback(() => {
    navigate(`/admin/user/${user.id}`)
  }, [navigate, user.id])

  return (
    <>
      <div
        key={key}
        className="flex cursor-pointer items-center rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-colors duration-200 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
        onClick={handleCellClick}
      >
        <img
          src={typeof user.imageUrl === "string" ? user.imageUrl : ""}
          alt={`${typeof user.lastName === "string" ? user.lastName : ""} ${typeof user.firstName === "string" ? user.firstName : ""}`}
          className="mr-4 h-12 w-12 rounded-full border-2 border-slate-200 object-cover dark:border-slate-600"
        />
        <div className="flex-1">
          <div className="text-base font-medium text-slate-900 dark:text-slate-100">
            {user.lastName} {user.firstName}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 font-semibold text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              {user.publicMetadata.role && user.publicMetadata.role !== ""
                ? Role.fromString(user.publicMetadata.role as string)?.ja
                : "未設定"}
            </span>
            <span className="text-slate-700 dark:text-slate-300">
              {translateYear(user.publicMetadata.year as string)}
            </span>
            <span className="text-slate-700 dark:text-slate-300">
              {translateGrade(user.publicMetadata.grade as number)}
            </span>
          </div>
        </div>
      </div>
    </>
  )
})
