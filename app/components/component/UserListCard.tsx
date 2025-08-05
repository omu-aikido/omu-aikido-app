import type { User } from "@clerk/react-router/ssr.server"
import React from "react"
import { useNavigate } from "react-router"

import { translateGrade, translateYear } from "~/lib/utils"
import { Role } from "~/lib/zod"

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
      className="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors duration-200 cursor-pointer"
      onClick={handleRowClick}
    >
      <td className="px-6 py-3 whitespace-nowrap">
        <div className="flex items-center">
          <img
            src={typeof user.imageUrl === "string" ? user.imageUrl : ""}
            alt={
              `${typeof user.lastName === "string" ? user.lastName : ""} ${typeof user.firstName === "string" ? user.firstName : ""}`
            }
            className="w-10 h-10 rounded-full object-cover border-2 border-slate-200 dark:border-slate-600"
          />
          <div className="ml-4">
            <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
              {typeof user.lastName === "string" ? user.lastName : ""} {typeof user.firstName === "string" ? user.firstName : ""}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          {user.publicMetadata.role && user.publicMetadata.role !== ""
            ? Role.fromString(user.publicMetadata.role as string)?.ja
            : "未設定"}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100">
        {translateYear(user.publicMetadata.year as string)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100">
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
        className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm p-4 flex items-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors duration-200"
        onClick={handleCellClick}
      >
        <img
          src={typeof user.imageUrl === "string" ? user.imageUrl : ""}
          alt={
            `${typeof user.lastName === "string" ? user.lastName : ""} ${typeof user.firstName === "string" ? user.firstName : ""}`
          }
          className="w-12 h-12 rounded-full object-cover border-2 border-slate-200 dark:border-slate-600 mr-4"
        />
        <div className="flex-1">
          <div className="font-medium text-slate-900 dark:text-slate-100 text-base">
            {user.lastName} {user.firstName}
          </div>
          <div className="flex flex-wrap gap-2 mt-1 text-xs items-center">
            <span className="inline-flex px-2 py-1 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
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
