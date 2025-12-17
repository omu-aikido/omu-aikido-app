interface MyRankingProps {
  rank: number
  total: number
  userTotal: number
}

export function MyRanking({ props }: { props: MyRankingProps | undefined | null }) {
  if (!props) return null

  const { rank, total, userTotal } = props

  const getRankColor = (rank: number) => {
    if (rank <= 3) return "text-yellow-600 dark:text-yellow-400"
    if (rank <= 10) return "text-blue-600 dark:text-blue-400"
    return "text-slate-600 dark:text-slate-400"
  }

  return (
    <div
      className="my-4 rounded-lg border border-slate-200 bg-white p-2 shadow-sm sm:p-3 dark:border-slate-700 dark:bg-slate-800"
      data-testid="my-ranking-container"
    >
      <h3 className="mb-2 flex justify-center font-bold" data-testid="my-ranking-title">
        月間ストリーク
      </h3>
      <div
        className="flex flex-row items-stretch gap-2 sm:gap-3"
        data-testid="my-ranking-content"
      >
        {/* 順位カード */}
        <div
          className="flex flex-1 flex-col items-center justify-center rounded-md border border-yellow-100 bg-linear-to-br from-yellow-50/70 to-slate-50 p-2 shadow-sm sm:p-3 dark:border-yellow-700 dark:from-yellow-900/20 dark:to-slate-700"
          data-testid="my-ranking-position"
        >
          <span
            className="mb-0.5 text-slate-500 dark:text-slate-400"
            data-testid="my-ranking-position-label"
          >
            あなたの順位
          </span>
          <div className="flex items-end gap-1.5" data-testid="my-ranking-position-value">
            <span
              className={`text-lg font-extrabold tracking-tight sm:text-xl ${getRankColor(Number(rank))}`}
            >
              {Number.isFinite(Number(rank)) ? `${Number(rank)}位` : "不明"}
            </span>
            <span className="pb-0.5 text-slate-500 sm:text-sm dark:text-slate-400">
              / {Number.isFinite(Number(total)) ? `${Number(total)}人中` : "不明"}
            </span>
          </div>
        </div>
        {/* 記録回数カード */}
        <div
          className="flex flex-1 flex-col items-center justify-center rounded-md border border-blue-100 bg-linear-to-br from-blue-50/70 to-slate-50 p-2 shadow-sm sm:p-3 dark:border-blue-700 dark:from-blue-900/20 dark:to-slate-700"
          data-testid="my-ranking-activity"
        >
          <span
            className="sm: mb-0.5 text-slate-500 dark:text-slate-400"
            data-testid="my-ranking-activity-label"
          >
            稽古回数
          </span>
          <span
            className="text-base font-bold text-blue-700 sm:text-lg dark:text-blue-200"
            data-testid="my-ranking-activity-value"
          >
            {Number.isFinite(Number(userTotal))
              ? `${Math.floor(Number(userTotal) / 1.5)}回`
              : "不明"}
          </span>
        </div>
      </div>
    </div>
  )
}
