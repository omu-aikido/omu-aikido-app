import { Link, useSearchParams } from "react-router"
import { tv } from "tailwind-variants"

import type { ActivityType } from "~/db/schema"
import { style } from "~/styles/component"

interface ActivitiesTableProps {
  activities: ActivityType[]
  page: number
  total: number
  limit: number
}

export function ActivitiesTable({
  activities,
  page,
  total,
  limit,
}: ActivitiesTableProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit))
  const [params] = useSearchParams()
  const makePageUrl = (p: number) => {
    if (p > 1) {
      params.set("page", String(p))
    } else {
      params.delete("page")
    }
    // ページング時にアンカーを付与
    return "?" + params.toString() + "#activities"
  }

  return (
    <div className={style.filterCard()} id="activities">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-200 dark:bg-slate-700">
            <tr>
              <th className={tablehead()}>日付</th>
              <th className={tablehead()}>稽古時間</th>
              <th className={tablehead()}>編集日</th>
            </tr>
          </thead>
          <tbody className="bg-slate-50 dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
            {activities.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  className="px-6 py-8 text-center text-slate-500 dark:text-slate-400"
                >
                  履歴はありません
                </td>
              </tr>
            ) : (
              activities.map(activity => (
                <tr key={activity.id} className={tableRow()}>
                  <td className={tableCell({ variant: "primary" })}>
                    {new Date(activity.date).toLocaleDateString("ja-JP")}
                  </td>
                  <td className={tableCell({ variant: "primary" })}>
                    {activity.period}時間
                  </td>
                  <td className={tableCell({ variant: "secondary" })}>
                    {activity.updatedAt
                      ? new Date(activity.updatedAt).toLocaleString("ja-JP")
                      : "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* ページングUI */}
      {totalPages > 1 && (
        <nav
          className="flex justify-center items-center gap-2 py-4"
          aria-label="ページネーション"
        >
          <Link
            to={makePageUrl(page - 1)}
            className={paginationButton({ disabled: page <= 1 })}
            aria-disabled={page <= 1}
            tabIndex={page <= 1 ? -1 : 0}
          >
            前へ
          </Link>
          <div className={paginationButton({ class: "border border-slate-500/30" })}>
            {page + "/" + totalPages}
          </div>
          <Link
            to={makePageUrl(page + 1)}
            className={paginationButton({ disabled: page >= totalPages })}
            aria-disabled={page >= totalPages}
            tabIndex={page >= totalPages ? -1 : 0}
          >
            次へ
          </Link>
        </nav>
      )}
    </div>
  )
}

const tablehead = tv({
  base: "px-2 py-3 text-center text-xs font-medium text-slate-500 dark:text-slate-300 bg-slate-200 dark:bg-slate-800/90 uppercase tracking-wider",
})

const tableRow = tv({
  base: "hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors duration-150",
})

const tableCell = tv({
  base: "px-2 py-4 whitespace-nowrap text-sm text-center",
  variants: {
    variant: {
      primary: "text-slate-900 dark:text-slate-100",
      secondary: "text-slate-500 dark:text-slate-400",
    },
  },
})

const paginationButton = tv({
  base: "px-3 py-1 rounded transition-colors duration-150 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500",
  variants: {
    active: {
      true: "bg-blue-600 text-white",
      false:
        "bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 text-slate-900 dark:text-slate-100",
    },
    disabled: { true: "pointer-events-none opacity-50", false: "" },
  },
})
