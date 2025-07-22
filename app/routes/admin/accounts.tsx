import { createClerkClient } from "@clerk/react-router/api.server"
import type { User } from "@clerk/react-router/ssr.server"
import React from "react"
import type { LoaderFunctionArgs, MetaFunction } from "react-router"
import { useNavigate, useSearchParams } from "react-router"

import type { Route } from "./+types/accounts"

import ClerkUsers from "~/components/component/ClerkUsers"
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
  const currentPage = parseInt(url.searchParams.get("page") || "0", 10)
  const limit = 15
  const offset = currentPage * limit
  const orderBy = "created_at"

  try {
    const clerkUsers = await clerkClient.users.getUserList({
      limit,
      offset,
      query: query.trim(),
      orderBy,
    })

    const users: User[] = clerkUsers.data.sort((a: User, b: User) => {
      return Role.compare(
        a.publicMetadata.role as string,
        b.publicMetadata.role as string,
      )
    })

    // 総ページ数を計算
    const totalPages = Math.ceil(clerkUsers.totalCount / limit)

    return { users, totalPages, currentPage, query }
  } catch {
    return { users: [] as User[], totalPages: 0, currentPage, query }
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
  const { users, totalPages, currentPage } = args.loaderData
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const currentQuery = searchParams.get("query") || ""
  const [query, setQuery] = React.useState(currentQuery)

  const handleSearch = () => {
    navigate({
      search: `?query=${encodeURIComponent(query)}`,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h2 className={style.text.subtitle()}>アカウント管理</h2>

        {/* 検索フォーム（SPA対応） */}
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
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
        users={users as User[]}
        totalPages={totalPages}
        currentPage={currentPage}
      />
    </div>
  )
}
