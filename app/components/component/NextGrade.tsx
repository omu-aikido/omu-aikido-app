import { translateGrade } from "~/lib/utils"

export function NextGrade(gradeData: {
  grade: number
  needToNextGrade: number
  forNextGrade: number
}) {
  const { grade, needToNextGrade, forNextGrade } = gradeData

  const targetGrade = grade >= 0 ? grade - 2 : grade - 1
  const promotionType = grade <= 1 ? (grade === 0 ? "昇級" : "昇段") : "昇級"
  const progressPercentage = ((forNextGrade - needToNextGrade) / forNextGrade) * 100

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
        {translateGrade(targetGrade)}
        {promotionType}まで
      </h2>
      <p className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 mb-4">
        {needToNextGrade} / {forNextGrade}{" "}
        <span className="text-base font-medium text-gray-600 dark:text-gray-400">日</span>
      </p>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
        <div
          className="bg-indigo-600 dark:bg-indigo-400 h-2.5 rounded-full"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  )
}
