import type { APIContext } from "astro"
import { countUsers, listUser, searchAccounts } from "@/src/lib/query/admin/clerk"
import { getRole, getProfile } from "@/src/lib/query/profile"

export const GET = async (context: APIContext) => {
  const auth = context.locals.auth()
  const userId = auth.userId
  if (!userId) return new Response("Unauthorized", { status: 401 })
  const profile = await getProfile({ userId: userId })
  if (profile instanceof Response) return new Response("Internal Server Error", { status: 500 })

  const role = getRole({ profile: profile })
  if (!role || !role.isManagement()) return new Response("Forbidden", { status: 403 })

  const query = context.url.searchParams.get("query")
  const page = context.url.searchParams.get("page") || "0"

  try {
    const totalUsers = await countUsers()
    const users = query ? await searchAccounts({ query }) : await listUser(parseInt(page) * 10)

    const totalPages = Math.ceil(totalUsers / 10)

    return new Response(
      JSON.stringify({
        users,
        totalPages,
        currentPage: parseInt(page),
      }),
      {
        headers: { "Content-Type": "application/json" },
      },
    )
  } catch {
    return new Response("Internal Server Error", { status: 500 })
  }
}
