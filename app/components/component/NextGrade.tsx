import { translateGrade } from "~/lib/utils"
import { style } from "~/styles/component"

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
    <div className={style.card.container()}>
      <div className="flex flex-row items-center justify-center gap-2 mb-4">
        <h2 className={style.text.sectionTitle({ class: "text-xl mb-0 mt-0.5" })}>
          {translateGrade(targetGrade)}
          {promotionType}まで
        </h2>
        <p className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
          {needToNextGrade} / {forNextGrade}{" "}
        </p>
        <span className="text-base font-medium text-gray-600 dark:text-gray-400 mt-1">
          日
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
        <div
          className="bg-indigo-600 dark:bg-indigo-400 h-2.5 rounded-full"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  )
}
