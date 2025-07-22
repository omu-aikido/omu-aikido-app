import type { User } from "@clerk/react-router/ssr.server"

import { translateGrade, translateYear } from "~/lib/utils"
import { Role } from "~/lib/zod"

// MARK: UserListRow
export function UserListRow({ key, user }: { key: string; user: User }) {
  return (
    <>
      <tr
        key={key}
        className="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors duration-200"
      >
        <td className="px-6 py-3 whitespace-nowrap">
          <div className="flex items-center">
            <img
              src={user.imageUrl}
              alt={`${user.lastName} ${user.firstName}`}
              className="w-10 h-10 rounded-full object-cover border-2 border-slate-200 dark:border-slate-600"
            />
            <div className="ml-4">
              <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {user.lastName} {user.firstName}
              </div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            {Role.fromString(user.publicMetadata.role as string)?.ja}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100">
          {translateYear(user.publicMetadata.year as string)}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100">
          {translateGrade(user.publicMetadata.grade as number)}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
          <a
            href={`/admin/user/${user.id}`}
            className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200"
          >
            編集
          </a>
        </td>
      </tr>
    </>
  )
}

// MARK: UsreCell
export function UserCell({ key, user }: { key: string; user: User }) {
  return (
    <>
      <div
        key={key}
        className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm p-4 flex items-center"
      >
        <img
          src={user.imageUrl}
          alt={`${user.lastName} ${user.firstName}`}
          className="w-12 h-12 rounded-full object-cover border-2 border-slate-200 dark:border-slate-600 mr-4"
        />
        <div className="flex-1">
          <div className="font-medium text-slate-900 dark:text-slate-100 text-base">
            {user.lastName} {user.firstName}
          </div>
          <div className="flex flex-wrap gap-2 mt-1 text-xs items-center">
            <span className="inline-flex px-2 py-1 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              {Role.fromString(user.publicMetadata.role as string)?.ja}
            </span>
            <span className="text-slate-700 dark:text-slate-300">
              {translateYear(user.publicMetadata.year as string)}
            </span>
            <span className="text-slate-700 dark:text-slate-300">
              {translateGrade(user.publicMetadata.grade as number)}
            </span>
          </div>
        </div>
        <a
          href={`/admin/user/${user.id}`}
          className="ml-4 px-3 py-1 border border-transparent text-xs leading-4 font-medium rounded-md text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200"
        >
          編集
        </a>
      </div>
    </>
  )
}
