import type { User } from "@clerk/react-router/ssr.server"
import { Link, useSearchParams } from "react-router"
import { tv } from "tailwind-variants"

import { UserCell, UserListRow } from "./UserListCard"

const pagenation = tv({
  base: [
    "m-2 px-3 py-2 text-sm font-medium  rounded-lg cursor-pointer",
    " border border-slate-300 dark:border-slate-700",
    "text-slate-700 bg-white hover:bg-slate-100",
    "dark:text-slate-400  dark:bg-slate-800 dark:hover:bg-slate-700",
  ],
  variants: {
    disabled: {
      true: ["text-slate-500 bg-slate-100 dark:bg-slate-700 ", "cursor-not-allowed"],
    },
  },
})

interface Props {
  users: User[]
  totalPages: number
  currentPage: number
  sortBy?: string
  sortOrder?: string
  onSort?: (sortBy: string) => void
}

export function ClerkUsers({ users, totalPages, currentPage, sortBy, sortOrder, onSort }: Props) {
  const [searchParams] = useSearchParams()
  
  const getSortIcon = (columnKey: string) => {
    if (sortBy !== columnKey) return "↕️"
    return sortOrder === "asc" ? "↑" : "↓"
  }

  const handleHeaderClick = (columnKey: string) => {
    if (onSort) {
      onSort(columnKey)
    }
  }

  const createPageLink = (page: number) => {
    const params = new URLSearchParams(searchParams)
    params.set("page", page.toString())
    return `?${params.toString()}`
  }

  return (
    <>
      <div className="mt-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm hidden sm:block">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
          <thead className="bg-slate-50 dark:bg-slate-900">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 select-none"
                onClick={() => handleHeaderClick("name")}
              >
                <div className="flex items-center gap-1">
                  ユーザー
                  <span className="text-xs">{getSortIcon("name")}</span>
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 select-none"
                onClick={() => handleHeaderClick("role")}
              >
                <div className="flex items-center gap-1">
                  役職
                  <span className="text-xs">{getSortIcon("role")}</span>
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 select-none"
                onClick={() => handleHeaderClick("year")}
              >
                <div className="flex items-center gap-1">
                  学年
                  <span className="text-xs">{getSortIcon("year")}</span>
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 select-none"
                onClick={() => handleHeaderClick("grade")}
              >
                <div className="flex items-center gap-1">
                  段位
                  <span className="text-xs">{getSortIcon("grade")}</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
            {users && users.length > 0 ? (
              users.map(user => <UserListRow user={user} key={user.id} />)
            ) : (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-4 text-center text-slate-500 dark:text-slate-400"
                >
                  ユーザーが見つかりませんでした
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="block sm:hidden mt-4 space-y-4">
        {users && users.length > 0 ? (
          users.map(user => <UserCell user={user} key={user.id} />)
        ) : (
          <div className="text-center text-slate-500 dark:text-slate-400 py-8">
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600">
                <span className="ml-2 text-slate-600 dark:text-slate-400">
                  読み込み中...
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* ページネーション: 共通 */}
      {totalPages > 0 && (
        <div className="flex gap-2 justify-center mt-4">
          <nav className="inline-flex -space-x-px">
            {currentPage > 0 ? (
              <Link to={createPageLink(currentPage - 1)} className={pagenation()}>
                前へ
              </Link>
            ) : (
              <p className={pagenation({ disabled: true })}>前へ</p>
            )}
            <div className="m-2 px-3 py-2 text-sm font-medium rounded-lg text-slate-600 dark:text-slate-300 bg-slate-200 border border-slate-300 dark:bg-slate-600 dark:border-slate-700">
              {currentPage + 1 + "/" + totalPages}
            </div>
            {currentPage < totalPages - 1 ? (
              <Link to={createPageLink(currentPage + 1)} className={pagenation()}>
                次へ
              </Link>
            ) : (
              <p className={pagenation({ disabled: true })}>次ヘ</p>
            )}
          </nav>
        </div>
      )}
    </>
  )
}

export default ClerkUsers
