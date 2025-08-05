import type { User } from "@clerk/react-router/ssr.server"
import React from "react"
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

// 追加: メディアクエリ用フック
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = React.useState(false)
  React.useEffect(() => {
    const media = window.matchMedia(query)
    if (media.matches !== matches) setMatches(media.matches)
    const listener = () => setMatches(media.matches)
    media.addEventListener("change", listener)
    return () => media.removeEventListener("change", listener)
  }, [matches, query])
  return matches
}

const ClerkUsers = React.memo<Props>(function ClerkUsers({
  users,
  totalPages,
  currentPage,
  sortBy,
  sortOrder,
  onSort,
}) {
  const [searchParams] = useSearchParams()
  const [showSort, setShowSort] = React.useState(false)
  const isMobile = useMediaQuery("(max-width: 639px)")

  const sortOptions = React.useMemo(
    () => [
      { key: "name", label: "名前順" },
      { key: "role", label: "役職順" },
      { key: "year", label: "学年順" },
      { key: "grade", label: "段位順" },
    ],
    [],
  )

  const getSortIcon = React.useCallback(
    (columnKey: string) => {
      if (sortBy !== columnKey) return "↕️"
      return sortOrder === "asc" ? "↑" : "↓"
    },
    [sortBy, sortOrder],
  )

  const handleHeaderClick = React.useCallback(
    (columnKey: string) => {
      if (onSort) {
        onSort(columnKey)
      }
    },
    [onSort],
  )

  const createPageLink = React.useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams)
      params.set("page", page.toString())
      return `?${params.toString()}`
    },
    [searchParams],
  )

  return (
    <>
      {/* PC用テーブル */}
      {!isMobile && (
        <div className="mt-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
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
      )}
      {/* モバイル用リスト + ソートUI */}
      {isMobile && (
        <div className="mt-4 space-y-4">
          <div className="flex justify-end mb-2">
            <button
              type="button"
              className="px-3 py-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-md text-sm font-medium border border-slate-300 dark:border-slate-600"
              onClick={() => setShowSort(v => !v)}
              aria-haspopup="listbox"
              aria-expanded={showSort}
            >
              ソート: {sortOptions.find(opt => opt.key === sortBy)?.label || "選択"}
            </button>
          </div>
          {showSort && (
            <div className="mb-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-md z-20 absolute left-0 right-0 mx-4">
              <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                {sortOptions.map(opt => (
                  <li key={opt.key}>
                    <button
                      type="button"
                      className={`w-full text-left px-4 py-2 text-sm ${sortBy === opt.key ? "bg-blue-100 dark:bg-blue-900 font-bold" : ""}`}
                      onClick={() => {
                        setShowSort(false)
                        if (onSort) onSort(opt.key)
                      }}
                    >
                      {opt.label}{" "}
                      {sortBy === opt.key ? (sortOrder === "asc" ? "↑" : "↓") : ""}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {/* ユーザーリスト */}
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
      )}
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
})

export { ClerkUsers }
export default ClerkUsers
