import type { User } from "@clerk/react-router/ssr.server"

import { UserCell, UserListRow } from "./UserListCard"

import { Role } from "~/lib/zod"

interface Props {
  users: User[]
  totalPages: number
  currentPage: number
}

export function ClerkUsers({ users, totalPages, currentPage }: Props) {
  return (
    <>
      <div className="mt-4 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm hidden sm:block">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  ユーザー
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  役職
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  学年
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  段位
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
              {users ? (
                users
                  .sort((a: User, b: User) => {
                    return Role.compare(
                      a.publicMetadata.role as string,
                      b.publicMetadata.role as string,
                    )
                  })
                  .map((user: User) => <UserListRow user={user} key={user.id} />)
              ) : (
                <tr>
                  1
                  <td
                    colSpan={5}
                    className="px-6 py-4 text-center text-slate-500 dark:text-slate-400"
                  >
                    ユーザーが見つかりませんでした
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div className="block sm:hidden mt-4 space-y-4">
        {users && users.length > 0 ? (
          users
            .sort((a: User, b: User) => {
              return Role.compare(
                a.publicMetadata.role as string,
                b.publicMetadata.role as string,
              )
            })
            .map((user: User) => <UserCell user={user} key={user.id} />)
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
      {totalPages > 1 && (
        <div className="flex gap-2 justify-center mt-4">
          <nav className="inline-flex -space-x-px">
            {currentPage > 0 && (
              <a
                href={`/admin/accounts?page=${currentPage - 1}`}
                className="m-2 px-3 py-2 text-sm font-medium text-slate-500 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 dark:hover:bg-slate-700"
              >
                前へ
              </a>
            )}
            <div className="m-2 px-3 py-2 text-sm font-medium rounded-lg text-slate-500 bg-slate-200 border border-slate-300 dark:bg-slate-600 dark:border-slate-700">
              {currentPage + 1 + "/" + totalPages}
            </div>
            {currentPage < totalPages - 1 && (
              <a
                href={`/admin/accounts?page=${currentPage + 1}`}
                className="m-2 px-3 py-2 text-sm font-medium text-slate-500 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 dark:hover:bg-slate-700"
              >
                次へ
              </a>
            )}
          </nav>
        </div>
      )}
    </>
  )
}

export default ClerkUsers
