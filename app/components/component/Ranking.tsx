import type { User } from "@clerk/react-router/server"
import React from "react"

// Define the interface for a single user's rank data
interface UserRank {
  userId: string
  total: number
}

// Define the props interface for the Ranking component
interface RankingProps {
  data: UserRank[]
  users: User[]
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
    <div className="w-full max-w-2xl mx-auto my-4">
      <h2 className="text-center text-slate-800 dark:text-slate-100 text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
        今月の稽古時間ランキング
      </h2>
      {sortedData.length === 0 ? (
        <p className="text-center text-slate-500 dark:text-slate-400 py-4">
          ランキングデータがありません。
        </p>
      ) : (
        <div className="overflow-x-auto rounded-md">
          <table className="min-w-full border-collapse text-sm sm:text-base">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-700">
                <th className="py-2 px-3 font-semibold text-slate-700 dark:text-slate-200 text-left w-24">
                  順位
                </th>
                <th className="py-2 px-3 font-semibold text-slate-700 dark:text-slate-200 text-left">
                  名前
                </th>
                <th className="py-2 px-3 font-semibold text-slate-700 dark:text-slate-200 text-right w-24">
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
                  <td className="py-2 px-3 text-slate-800 dark:text-slate-100 font-mono">
                    #{index + 1}
                  </td>
                  <td className="py-2 px-3 text-slate-700 dark:text-slate-200 whitespace-nowrap">
                    {userMap.get(item.userId) ?? "不明"}
                  </td>
                  <td className="py-2 px-3 text-slate-900 dark:text-slate-100 text-right font-bold">
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
