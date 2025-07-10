import React, { useState, useEffect, useMemo } from "react"

interface Activity {
  id: string
  date: string
  period: string
  userId: string
}

interface Props {
  startDate?: Date
  endDate?: Date
  page?: number
  baseUrl?: string
}

const ActivityList: React.FC<Props> = ({ startDate, endDate, page = 1, baseUrl }) => {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(page)
  const [sortOrder] = useState<"asc" | "desc">("desc")
  const itemsPerPage = 8

  // Fetch activities from API
  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true)
      try {
        const url = new URL("/api/me/activities", window.location.origin)
        if (startDate) url.searchParams.set("startDate", startDate.toISOString().split("T")[0])
        if (endDate) url.searchParams.set("endDate", endDate.toISOString().split("T")[0])

        const response = await fetch(url.toString())
        if (response.ok) {
          const data = (await response.json()) as Activity[]
          setActivities(data)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()
  }, [startDate, endDate])

  // Sort activities based on current sort order
  const sortedActivities = useMemo(() => {
    return [...activities].sort((a, b) => {
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA
    })
  }, [activities, sortOrder])

  // Pagination calculations
  const totalItems = sortedActivities.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const safePage = Math.max(1, Math.min(currentPage, Math.max(1, totalPages)))
  const startIndex = (safePage - 1) * itemsPerPage
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems)
  const paginatedActivities = sortedActivities.slice(startIndex, endIndex)

  // Update URL when page or sort changes
  useEffect(() => {
    const url = new URL(baseUrl || window.location.href)
    url.searchParams.set("page", safePage.toString())
    url.searchParams.set("sort", sortOrder)
    window.history.replaceState({}, "", url.toString())
  }, [safePage, sortOrder, baseUrl])

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage)
    }
  }

  const tableStyles = {
    container: "overflow-x-auto shadow-sm border border-slate-200 rounded-lg dark:border-slate-700",
    table: "min-w-full divide-y divide-slate-200 dark:divide-slate-700",
    thead: {
      container: "bg-slate-50 dark:bg-slate-800",
      tr: "",
      th: "px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider dark:text-slate-400",
    },
    tbody: {
      tr: "bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800",
      td: "px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100",
    },
  }

  const paginationStyles = {
    button: (disabled: boolean) =>
      `inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
        disabled
          ? "text-slate-400 bg-slate-100 cursor-not-allowed dark:text-slate-600 dark:bg-slate-800"
          : "text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500 dark:text-slate-300 dark:bg-slate-700 dark:border-slate-600 dark:hover:bg-slate-600"
      }`,
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-slate-600 dark:text-slate-400">読み込み中...</span>
      </div>
    )
  }

  return (
    <div>
      <div id="activity-list-container" className={tableStyles.container}>
        <table className={tableStyles.table}>
          <thead className={tableStyles.thead.container}>
            <tr className={tableStyles.thead.tr}>
              <th className={tableStyles.thead.th}>日付</th>
              <th className={tableStyles.thead.th}>稽古時間</th>
              <th className={tableStyles.thead.th}>操作</th>
            </tr>
          </thead>
          <tbody>
            {paginatedActivities.length === 0 ? (
              <tr className={tableStyles.tbody.tr}>
                <td className={tableStyles.tbody.td} colSpan={3}>
                  <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                    <div className="mb-2 text-lg">履歴はありません</div>
                    <div className="text-sm">新しい稽古記録を追加しましょう！</div>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedActivities.map((activity) => (
                <tr key={activity.id} className={tableStyles.tbody.tr}>
                  <td className={tableStyles.tbody.td}>
                    {new Date(activity.date).toLocaleDateString("ja-JP")}
                  </td>
                  <td className={tableStyles.tbody.td}>{activity.period}</td>
                  <td className={tableStyles.tbody.td}>
                    <a
                      className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-slate-700 bg-slate-100 border border-slate-300 rounded-md hover:bg-slate-200 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-1 transition-colors duration-200 dark:text-slate-300 dark:bg-slate-700 dark:border-slate-600 dark:hover:bg-slate-600 dark:hover:text-slate-100 dark:focus:ring-slate-400"
                      href={`/apps/record/edit/${activity.id}?page=${safePage}&sort=${sortOrder}`}
                    >
                      編集
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages >= 1 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="pagination-info">
            {totalItems}件中 {startIndex + 1}-{endIndex}件表示
          </div>
          <div>
            {safePage}/{totalPages}
          </div>
          <div className="pagination-controls flex gap-2">
            <button
              onClick={() => handlePageChange(safePage - 1)}
              className={paginationStyles.button(safePage <= 1)}
              disabled={safePage <= 1}
            >
              前へ
            </button>
            <button
              onClick={() => handlePageChange(safePage + 1)}
              className={paginationStyles.button(safePage >= totalPages)}
              disabled={safePage >= totalPages}
            >
              次へ
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ActivityList
