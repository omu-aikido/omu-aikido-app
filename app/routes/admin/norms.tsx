import type { User } from "@clerk/react-router/server"
import { createClerkClient } from "@clerk/react-router/server"
import { ArrowDown01, ArrowUp01, Search } from "lucide-react"
import { useMemo } from "react"
import type { LoaderFunctionArgs, MetaFunction } from "react-router"
import { useSearchParams } from "react-router"

import type { Route } from "./+types/norms"

import { NormCard } from "~/components/component/NormCard"
import { Input } from "~/components/ui/input"
import { getUsersNorm } from "~/lib/query/admin"

// MARK: Constants
const MAX_SEARCH_LENGTH = 100
const MAX_USERS_LIMIT = 500
const PERCENTAGE_MULTIPLIER = 100

// MARK: Types
type UserNorm = {
  userId: string
  current: number
  required: number
  grade: number
  lastPromotionDate: string | null
}

// MARK: Helper Functions
function sortByProgress<T extends { progress: number; isMet: boolean }>(
  a: T,
  b: T,
  order: "asc" | "desc",
): number {
  if (order === "asc") {
    // Ascending: unmet first (worst progress first), then met
    if (a.isMet !== b.isMet) return a.isMet ? 1 : -1
    return a.progress - b.progress
  } else {
    // Descending: met first (best progress first), then unmet
    if (a.isMet !== b.isMet) return a.isMet ? -1 : 1
    return b.progress - a.progress
  }
}

// MARK: Loader
export async function loader(args: LoaderFunctionArgs) {
  const { request, context } = args
  const env = context.cloudflare.env
  const clerkClient = createClerkClient({ secretKey: env.CLERK_SECRET_KEY })

  const url = new URL(request.url)
  const rawSearch = url.searchParams.get("search") || ""
  const search = rawSearch.trim().slice(0, MAX_SEARCH_LENGTH)

  try {
    // 全件取得（100ユーザー以下想定）
    const clerkUsers = await clerkClient.users.getUserList({
      limit: MAX_USERS_LIMIT, // 十分に大きな値で全件取得
      query: search,
      orderBy: "created_at",
    })

    const users: User[] = clerkUsers.data

    const norms = await getUsersNorm({ userIds: users.map(user => user.id), env })

    return { users, search, norms }
  } catch {
    return { users: [] as User[], search, norms: [] as UserNorm[] }
  }
}

// MARK: Meta
export const meta: MetaFunction = () => {
  return [
    { title: "稽古日数 - ハム大合気ポータル" },
    {
      name: "description",
      content: "部員の昇級・昇段審査に向けた稽古ノルマの進捗状況を確認します。",
    },
  ]
}

// MARK: Main Component
export default function NormsPage(args: Route.ComponentProps) {
  const { users, norms } = args.loaderData
  const [searchParams, setSearchParams] = useSearchParams()

  const searchTerm = searchParams.get("search") || ""
  const filterStatus = (searchParams.get("filter") as "all" | "met" | "unmet") || "all"
  const sortOrder = (searchParams.get("sort") as "asc" | "desc") || "desc"

  const updateSearchParams = (updates: Record<string, string>) => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev)
      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          newParams.set(key, value)
        } else {
          newParams.delete(key)
        }
      })
      return newParams
    })
  }

  const filteredUsers = useMemo(() => {
    return users
      .map(user => {
        const userNorm = norms.find(n => n.userId === user.id)
        const current = userNorm?.current || 0
        const required = userNorm?.required || 1
        const progress = (current / required) * PERCENTAGE_MULTIPLIER
        const isMet = current >= required

        return { user, norm: userNorm, progress, isMet }
      })
      .filter(({ user, isMet }) => {
        const searchLower = searchTerm.toLowerCase()
        const fullName = `${user.lastName || ""} ${user.firstName || ""}`.toLowerCase()
        const matchesSearch = fullName.includes(searchLower)

        const matchesStatus =
          filterStatus === "all" ||
          (filterStatus === "met" && isMet) ||
          (filterStatus === "unmet" && !isMet)

        return matchesSearch && matchesStatus
      })
      .sort((a, b) => sortByProgress(a, b, sortOrder))
  }, [users, norms, searchTerm, filterStatus, sortOrder])

  return (
    <div className="space-y-8 p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between ">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="名前で検索..."
            value={searchTerm}
            onChange={e => updateSearchParams({ search: e.target.value })}
            className="pl-9 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
          />
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-lg">
            <button
              onClick={() => updateSearchParams({ sort: "asc" })}
              className={`p-1.5 rounded-md transition-all ${
                sortOrder === "asc"
                  ? "bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
              title="進捗率が低い順"
            >
              <ArrowUp01 className="h-4 w-4" />
            </button>
            <button
              onClick={() => updateSearchParams({ sort: "desc" })}
              className={`p-1.5 rounded-md transition-all ${
                sortOrder === "desc"
                  ? "bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
              title="進捗率が高い順（達成優先）"
            >
              <ArrowDown01 className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-lg">
              <button
                onClick={() => updateSearchParams({ filter: "all" })}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                  filterStatus === "all"
                    ? "bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                全て
              </button>
              <button
                onClick={() => updateSearchParams({ filter: "unmet" })}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                  filterStatus === "unmet"
                    ? "bg-white dark:bg-slate-950 text-red-600 dark:text-red-400 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                未達成
              </button>
              <button
                onClick={() => updateSearchParams({ filter: "met" })}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                  filterStatus === "met"
                    ? "bg-white dark:bg-slate-950 text-emerald-600 dark:text-emerald-400 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                達成済
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredUsers.map(({ user, norm, progress }) => (
          <NormCard key={user.id} user={user} norm={norm} progress={progress} />
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12 text-slate-500 dark:text-slate-400">
          <p>該当するユーザーが見つかりません</p>
        </div>
      )}
    </div>
  )
}
