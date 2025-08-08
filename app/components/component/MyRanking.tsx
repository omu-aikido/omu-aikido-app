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
    <div className="my-4 p-2 sm:p-3 border border-slate-200 dark:border-slate-700 rounded-lg shadow bg-white dark:bg-slate-800">
      <h3 className="font-bold flex justify-center mb-2">月間ストリーク</h3>
      <div className="flex flex-row gap-2 sm:gap-3 items-stretch">
        {/* 順位カード */}
        <div className="flex-1 flex flex-col justify-center items-center p-2 sm:p-3 rounded-md bg-gradient-to-br from-yellow-50/70 to-slate-50 dark:from-yellow-900/20 dark:to-slate-700 border border-yellow-100 dark:border-yellow-700 shadow-sm">
          <span className="text-slate-500 dark:text-slate-400 mb-0.5">あなたの順位</span>
          <div className="flex items-end gap-1.5">
            <span
              className={`text-lg sm:text-xl font-extrabold tracking-tight ${getRankColor(Number(rank))}`}
            >
              {Number.isFinite(Number(rank)) ? `${Number(rank)}位` : "不明"}
            </span>
            <span className="text-slate-500 dark:text-slate-400  sm:text-sm pb-0.5">
              / {Number.isFinite(Number(total)) ? `${Number(total)}人中` : "不明"}
            </span>
          </div>
        </div>
        {/* 記録回数カード */}
        <div className="flex-1 flex flex-col justify-center items-center p-2 sm:p-3 rounded-md bg-gradient-to-br from-blue-50/70 to-slate-50 dark:from-blue-900/20 dark:to-slate-700 border border-blue-100 dark:border-blue-700 shadow-sm">
          <span className="text-slate-500 dark:text-slate-400  sm: mb-0.5">稽古回数</span>
          <span className="text-base sm:text-lg font-bold text-blue-700 dark:text-blue-200">
            {Number.isFinite(Number(userTotal))
              ? `${Math.floor(Number(userTotal) / 1.5)}回`
              : "不明"}
          </span>
        </div>
      </div>
    </div>
  )
}
