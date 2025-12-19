import { timeForNextGrade } from "@/app/lib/utils"

export function StatsSection({
  totalTrainCount,
  currentGradeTrainCount,
  grade,
  totalDays,
  totalEntries,
  totalHours,
}: {
  totalTrainCount: number
  currentGradeTrainCount: number
  grade: number
  totalDays: number
  totalEntries: number
  totalHours: number
}) {
  return (
    <details
      className="mb-6 rounded-md bg-slate-100 p-4 shadow-md dark:bg-slate-800/50"
      data-testid="stats-section"
    >
      <summary
        className="grid cursor-pointer grid-cols-2 gap-4"
        data-testid="stats-summary"
      >
        <div>
          <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
            次の級段位まで
          </p>
          <p className="text-lg font-bold text-yellow-900 dark:text-yellow-100">
            {Math.max(
              0,
              Number(timeForNextGrade(grade)) - Number(currentGradeTrainCount),
            )}
            /{Number(timeForNextGrade(grade))}回
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
            累計稽古回数
          </p>
          <p className="text-lg font-bold text-purple-900 dark:text-purple-100">
            {Number(totalTrainCount)}回
          </p>
        </div>
      </summary>
      <hr className="mt-3" />
      <div className="grid grid-cols-2 gap-4 py-4" data-testid="stats-details">
        <div>
          <span className="block text-xs text-slate-500">総稽古日数</span>
          <span className="text-base font-bold">{Number(totalDays)}日</span>
        </div>
        <div>
          <span className="block text-xs text-slate-500">総記録数</span>
          <span className="text-base font-bold">{Number(totalEntries)}回</span>
        </div>
        <div>
          <span className="block text-xs text-slate-500">総稽古時間</span>
          <span className="text-base font-bold">{Number(totalHours)}時間</span>
        </div>
        <div>
          <span className="block text-xs text-slate-500">現級段位での稽古回数</span>
          <span className="text-base font-bold">{Number(currentGradeTrainCount)}回</span>
        </div>
      </div>
    </details>
  )
}
