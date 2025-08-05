import { createClerkClient } from "@clerk/react-router/api.server"
import type { User } from "@clerk/react-router/ssr.server"
import React from "react"
import type { LoaderFunctionArgs, MetaFunction } from "react-router"
import { useNavigate, useSearchParams } from "react-router"

import type { Route } from "./+types/accounts"

import ClerkUsers from "~/components/component/ClerkUsers"
import Ranking from "~/components/component/Ranking"
import { getMonthlyRanking } from "~/lib/query/activity"
import { Role } from "~/lib/zod"
import { style } from "~/styles/component"

// MARK: Loader
export async function loader(args: LoaderFunctionArgs) {
  const { request, context } = args
  const clerkClient = createClerkClient({
    secretKey: context.cloudflare.env.CLERK_SECRET_KEY,
  })

  const url = new URL(request.url)
  const query = url.searchParams.get("query") || ""

  try {
    // 全件取得（100ユーザー以下想定）
    const clerkUsers = await clerkClient.users.getUserList({
      limit: 500, // 十分に大きな値で全件取得
      query: query.trim(),
      orderBy: "created_at",
    })

    const users: User[] = clerkUsers.data

    const ranking = await getMonthlyRanking({year: new Date().getUTCFullYear(),month: new Date().getUTCMonth(), env: context.cloudflare.env})

    return { users, query, ranking }
  } catch {
    return { users: [] as User[], query, ranking: [] as { userId: string; total: number }[] }
  }
}

// MARK: Meta
export const meta: MetaFunction = () => {
  return [
    { title: "アカウント管理 - ハム大合気ポータル" },
    { name: "description", content: "合気道部員のアカウント管理画面" },
  ]
}

// MARK: Component
export default function AdminAccounts(args: Route.ComponentProps) {
  const { users } = args.loaderData
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const currentQuery = searchParams.get("query") || ""
  const sortBy = searchParams.get("sortBy") || "role"
  const sortOrder = searchParams.get("sortOrder") || "asc"
  const currentPage = parseInt(searchParams.get("page") || "0", 10)

  const [query, setQuery] = React.useState(currentQuery)

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams)
    params.set("query", query)
    params.delete("page")
    navigate({ search: params.toString() })
  }

  const handleSort = (newSortBy: string) => {
    const params = new URLSearchParams(searchParams)
    if (sortBy === newSortBy) {
      // 同じ項目をクリックした場合は順序を反転
      params.set("sortOrder", sortOrder === "asc" ? "desc" : "asc")
    } else {
      // 新しい項目の場合は昇順に設定
      params.set("sortBy", newSortBy)
      params.set("sortOrder", "asc")
    }
    params.delete("page") // ソート時はページをリセット
    navigate({ search: params.toString() })
  }

  // クライアントサイドでフィルタリング・ソート・ページング
  const filteredAndSortedUsers = React.useMemo(() => {
    let filtered = users

    // 検索フィルタ（既にサーバーサイドで適用されているが、念のため）
    if (currentQuery) {
      const searchLower = currentQuery.toLowerCase()
      filtered = users.filter((user) => {
        const fullName = user.fullName || ""
        const firstName = user.firstName || ""
        const lastName = user.lastName || ""
        const email = user.emailAddresses[0]?.emailAddress || ""
        return (
          fullName.toLowerCase().includes(searchLower) ||
          firstName.toLowerCase().includes(searchLower) ||
          lastName.toLowerCase().includes(searchLower) ||
          email.toLowerCase().includes(searchLower)
        )
      })
    }

    // ソート
    const sorted = [...filtered].sort((a, b) => {
      let aValue: string | number, bValue: string | number

      switch (sortBy) {
        case "name":
          aValue = `${a.lastName || ""} ${a.firstName || ""}`.trim()
          bValue = `${b.lastName || ""} ${b.firstName || ""}`.trim()
          break
        case "year":
          const yearOrder = { "b1": 1, "b2": 2, "b3": 3, "b4": 4, "m1": 5, "m2": 6, "d1": 7, "d2": 8, "": 0}
          const aYear = (a.publicMetadata.year as unknown as string) || ""
          const bYear = (b.publicMetadata.year as unknown as string) || ""
          aValue = yearOrder[aYear as keyof typeof yearOrder] ?? 999
          bValue = yearOrder[bYear as keyof typeof yearOrder] ?? 999
          break
        case "grade":
          const aGrade = a.publicMetadata.grade
          const bGrade = b.publicMetadata.grade
          const normalizeGrade = (grade: number | null | undefined) => {
            if (grade === null || grade === undefined) return -1000 // 不明は最下位
            if (grade === 0) return -999 // 0は不明の次に下位
            if (grade !== 0) return -grade
            return grade
          }
          aValue = normalizeGrade(aGrade)
          bValue = normalizeGrade(bGrade)
          break
        case "role":
        default:
          const aRole = (a.publicMetadata.role as unknown) as string
          const bRole = (b.publicMetadata.role as unknown) as string
          const normalizeRole = (roleStr: string) => {
            const role = Role.fromString(roleStr)
            if (role === null) return 999 // 不明な役職は最下位
            return Role.ALL.indexOf(role)
          }
          aValue = normalizeRole(aRole)
          bValue = normalizeRole(bRole)
          if (aValue === bValue) {
            aValue = new Date(a.createdAt).getTime()
            bValue = new Date(b.createdAt).getTime()
          }
          break
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1
      return 0
    })

    return sorted
  }, [users, currentQuery, sortBy, sortOrder])

  // ページング
  const pageSize = 15
  const totalPages = Math.ceil(filteredAndSortedUsers.length / pageSize)
  const startIndex = currentPage * pageSize
  const endIndex = startIndex + pageSize
  const paginatedUsers = filteredAndSortedUsers.slice(startIndex, endIndex)

  return (
    <div className="space-y-6">

      {
        args.loaderData.ranking.length > 0 &&
        <Ranking data={args.loaderData.ranking} users={users as User[]} />
      }

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h2 className={style.text.subtitle()}>アカウント管理</h2>
        {/* 検索フォーム（SPA対応） */}
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="名前・メアドで検索..."
            className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
          >
            検索
          </button>
        </div>
      </div>

      <ClerkUsers
        users={paginatedUsers as User[]}
        totalPages={totalPages}
        currentPage={currentPage}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
      />
    </div>
  )
}
