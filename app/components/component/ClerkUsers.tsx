import type { ApiUser } from "@/type/api-user"
import React from "react"
import { Link, useSearchParams } from "react-router"
import { tv } from "tailwind-variants"

import { UserCell, UserListRow } from "./UserListCard"

const pagenation = tv({
  base: [
    "m-2 cursor-pointer rounded-lg px-3 py-2 text-sm font-medium",
    "border border-slate-300 dark:border-slate-700",
    "bg-white text-slate-700 hover:bg-slate-100",
    "dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700",
  ],
  variants: {
    disabled: {
      true: ["bg-slate-100 text-slate-500 dark:bg-slate-700", "cursor-not-allowed"],
    },
  },
})

interface Props {
  users: ApiUser[]
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
        <div className="mt-4 rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-900">
              <tr>
                <th
                  className="cursor-pointer px-6 py-3 text-left text-xs font-medium tracking-wider text-slate-500 uppercase select-none hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                  onClick={() => handleHeaderClick("name")}
                >
                  <div className="flex items-center gap-1">
                    ユーザー
                    <span className="text-xs">{getSortIcon("name")}</span>
                  </div>
                </th>
                <th
                  className="cursor-pointer px-6 py-3 text-left text-xs font-medium tracking-wider text-slate-500 uppercase select-none hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                  onClick={() => handleHeaderClick("role")}
                >
                  <div className="flex items-center gap-1">
                    役職
                    <span className="text-xs">{getSortIcon("role")}</span>
                  </div>
                </th>
                <th
                  className="cursor-pointer px-6 py-3 text-left text-xs font-medium tracking-wider text-slate-500 uppercase select-none hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                  onClick={() => handleHeaderClick("year")}
                >
                  <div className="flex items-center gap-1">
                    学年
                    <span className="text-xs">{getSortIcon("year")}</span>
                  </div>
                </th>
                <th
                  className="cursor-pointer px-6 py-3 text-left text-xs font-medium tracking-wider text-slate-500 uppercase select-none hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                  onClick={() => handleHeaderClick("grade")}
                >
                  <div className="flex items-center gap-1">
                    段位
                    <span className="text-xs">{getSortIcon("grade")}</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-700 dark:bg-slate-800">
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
          <div className="mb-2 flex justify-end">
            <button
              type="button"
              className="rounded-md border border-slate-300 bg-slate-200 px-3 py-1 text-sm font-medium text-slate-700 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
              onClick={() => setShowSort(v => !v)}
              aria-haspopup="listbox"
              aria-expanded={showSort}
            >
              ソート: {sortOptions.find(opt => opt.key === sortBy)?.label || "選択"}
            </button>
          </div>
          {showSort && (
            <div className="absolute right-0 left-0 z-20 mx-4 mb-2 rounded-md border border-slate-300 bg-white shadow-md dark:border-slate-600 dark:bg-slate-800">
              <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                {sortOptions.map(opt => (
                  <li key={opt.key}>
                    <button
                      type="button"
                      className={`w-full px-4 py-2 text-left text-sm ${sortBy === opt.key ? "bg-blue-100 font-bold dark:bg-blue-900" : ""}`}
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
            <div className="py-8 text-center text-slate-500 dark:text-slate-400">
              <div className="flex items-center justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600">
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
        <div className="mt-4 flex justify-center gap-2">
          <nav className="inline-flex -space-x-px">
            {currentPage > 0 ? (
              <Link to={createPageLink(currentPage - 1)} className={pagenation()}>
                前へ
              </Link>
            ) : (
              <p className={pagenation({ disabled: true })}>前へ</p>
            )}
            <div className="m-2 rounded-lg border border-slate-300 bg-slate-200 px-3 py-2 text-sm font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-600 dark:text-slate-300">
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
