import { timeForNextGrade } from "~/lib/utils"

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
    <details className="p-4 mb-6  shadow-md rounded-md bg-slate-100 dark:bg-slate-800/50">
      <summary className="grid grid-cols-2 gap-4 cursor-pointer">
        <div>
          <p className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">
            次の級段位まで
          </p>
          <p className="text-lg font-bold text-yellow-900 dark:text-yellow-100">
            {timeForNextGrade(grade) - currentGradeTrainCount}/{timeForNextGrade(grade)}回
          </p>
        </div>
        <div>
          <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">
            累計稽古回数
          </p>
          <p className="text-lg font-bold text-purple-900 dark:text-purple-100">
            {totalTrainCount}回
          </p>
        </div>
      </summary>
      <hr className="mt-3" />
      <div className="grid grid-cols-2 gap-4 py-4">
        <div>
          <span className="block text-xs text-slate-500">総稽古日数</span>
          <span className="font-bold text-base">{totalDays}日</span>
        </div>
        <div>
          <span className="block text-xs text-slate-500">総記録数</span>
          <span className="font-bold text-base">{totalEntries}回</span>
        </div>
        <div>
          <span className="block text-xs text-slate-500">総稽古時間</span>
          <span className="font-bold text-base">{totalHours}時間</span>
        </div>
        <div>
          <span className="block text-xs text-slate-500">現級段位での稽古回数</span>
          <span className="font-bold text-base">{currentGradeTrainCount}回</span>
        </div>
      </div>
    </details>
  )
}
