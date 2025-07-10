import { useState, useEffect } from "react"
import type { User } from "@clerk/astro/server"
import { translateYear, translateGrade } from "@/src/utils"
import { Role } from "@/src/zod"

interface Props {
  query: string | null
  paging: string
}

const ClerkUsers: React.FC<Props> = ({ query, paging }) => {
  const [users, setUsers] = useState<User[]>([])
  const [pageingStatus, setPageingStatus] = useState({
    current: parseInt(paging),
    total: 0,
  })

  useEffect(() => {
    const fetchUsers = async () => {
      const response = await fetch(
        `/api/admin/users?query=${query || ""}&page=${pageingStatus.current}`,
      )
      const data = (await response.json()) as {
        users: User[]
        totalPages: number
        currentPage: number
      }
      setUsers(data.users)
      setPageingStatus((prev) => ({ ...prev, total: data.totalPages }))
    }

    fetchUsers()
  }, [query, pageingStatus.current])

  return (
    <>
      <div className="mt-4 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
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
                  .map((user: User) => (
                    <tr
                      key={user.id}
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
                          href={`/admin/account/${user.id}`}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200"
                        >
                          編集
                        </a>
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
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
      {pageingStatus.total > 1 && (
        <div className="flex gap-2 justify-center mt-4">
          <nav className="inline-flex -space-x-px">
            {pageingStatus.current > 0 && (
              <a
                href={`/admin/account?page=${pageingStatus.current - 1}`}
                className="m-2 px-3 py-2 text-sm font-medium text-slate-500 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 dark:hover:bg-slate-700"
              >
                前へ
              </a>
            )}
            <div className="m-2 px-3 py-2 text-sm font-medium rounded-lg text-slate-500 bg-slate-200 border border-slate-300 dark:bg-slate-600 dark:border-slate-700">
              {pageingStatus.current + 1 + "/" + pageingStatus.total}
            </div>
            {pageingStatus.current < pageingStatus.total - 1 && (
              <a
                href={`/admin/account?page=${pageingStatus.current + 1}`}
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
