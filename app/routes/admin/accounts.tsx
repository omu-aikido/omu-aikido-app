import { createClerkClient } from "@clerk/react-router/api.server"
import type { User } from "@clerk/react-router/ssr.server"
import type { LoaderFunctionArgs, MetaFunction } from "react-router"
import { useSearchParams } from "react-router"

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
  const limit = 20
  const offset = currentPage * limit

  try {
    // クエリパラメータを適切に設定
    const getUserListParams = {
      limit,
      offset,
      query,
    }

    // 検索クエリがある場合は追加
    if (query.trim()) {
      getUserListParams.query = query.trim()
    }

    const clerkUsers = await clerkClient.users.getUserList(getUserListParams)

    const users: User[] = clerkUsers.data.sort((a: User, b: User) => {
      return Role.compare(a.publicMetadata.role as string, b.publicMetadata.role as string)
    })

    // 総ページ数を計算
    const totalPages = Math.ceil(clerkUsers.totalCount / limit)

    return {
      users,
      totalPages,
      currentPage,
      query,
    }
  } catch {
    return {
      users: [] as User[],
      totalPages: 0,
      currentPage,
      query,
    }
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
  const currentQuery = searchParams.get("query") || ""

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h2 className={style.text.subtitle()}>アカウント管理</h2>

        {/* 検索フォーム */}
        <form method="get" className="flex gap-2">
          <input
            type="text"
            name="query"
            defaultValue={currentQuery}
            placeholder="名前・メアドで検索..."
            className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
          >
            検索
          </button>
        </form>
      </div>
      <ClerkUsers users={users as User[]} totalPages={totalPages} currentPage={currentPage} />
    </div>
  )
}
