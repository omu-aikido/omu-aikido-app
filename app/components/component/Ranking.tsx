import type { ApiUser } from "@/type/api-user"
import React from "react"

// Define the interface for a single user's rank data
interface UserRank {
  userId: string
  total: number
}

// Define the props interface for the Ranking component
interface RankingProps {
  data: UserRank[]
  users: ApiUser[]
}

const Ranking = React.memo<RankingProps>(function Ranking({ data, users }) {
  // Sort the data by 'total' in descending order to determine ranks
  const sortedData = React.useMemo(
    () => (Array.isArray(data) ? [...data].sort((a, b) => b.total - a.total) : []),
    [data],
  )
  const userMap = React.useMemo(
    () => new Map(users.map(user => [user.id, `${user.lastName} ${user.firstName}`])),
    [users],
  )

  // Input Validation: Ensure data is an array
  if (!Array.isArray(data)) {
    return (
      <p className="text-red-600 dark:text-red-400">
        Error: Invalid ranking data provided.
      </p>
    )
  }

  return (
    <div className="mx-auto my-4 w-full max-w-2xl">
      <h2 className="mb-3 text-center text-lg font-semibold text-slate-800 sm:mb-4 sm:text-xl dark:text-slate-100">
        今月の稽古時間ランキング
      </h2>
      {sortedData.length === 0 ? (
        <p className="py-4 text-center text-slate-500 dark:text-slate-400">
          ランキングデータがありません。
        </p>
      ) : (
        <div className="overflow-x-auto rounded-md">
          <table className="min-w-full border-collapse text-sm sm:text-base">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-700">
                <th className="w-24 px-3 py-2 text-left font-semibold text-slate-700 dark:text-slate-200">
                  順位
                </th>
                <th className="px-3 py-2 text-left font-semibold text-slate-700 dark:text-slate-200">
                  名前
                </th>
                <th className="w-24 px-3 py-2 text-right font-semibold text-slate-700 dark:text-slate-200">
                  時間
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((item, index) => (
                <tr
                  key={item.userId}
                  className={
                    index % 2 === 0
                      ? "bg-white dark:bg-slate-800"
                      : "bg-slate-50 dark:bg-slate-700"
                  }
                >
                  <td className="px-3 py-2 font-mono text-slate-800 dark:text-slate-100">
                    #{index + 1}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-slate-700 dark:text-slate-200">
                    {userMap.get(item.userId) ?? "不明"}
                  </td>
                  <td className="px-3 py-2 text-right font-bold text-slate-900 dark:text-slate-100">
                    {item.total}時間
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
})

export default Ranking
