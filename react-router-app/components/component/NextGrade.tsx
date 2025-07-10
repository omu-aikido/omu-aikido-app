import { useState, useEffect } from "react"
import { translateGrade } from "@/src/utils"

export const NextGrade: React.FC = () => {
  // ここを export const に変更
  const [gradeData, setGradeData] = useState<{
    grade: number
    needToNextGrade: number
    forNextGrade: number
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchNextGradeData = async () => {
      try {
        const res = await fetch(window.location.origin + "/api/user/profile/next", {
          method: "GET",
        })
        if (!res.ok) {
          throw new Error("Failed to fetch next grade data")
        }
        const data = (await res.json()) as {
          grade: number
          needToNextGrade: number
          forNextGrade: number
        }
        setGradeData(data)
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message)
        } else {
          setError("An unknown error occurred")
        }
      }
    }
    fetchNextGradeData()
  }, [])

  if (error) {
    return <div className="text-red-500">Error: {error}</div>
  }

  if (!gradeData) {
    return (
      <div className="flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
          <span
            className="inline-block bg-gray-200 dark:bg-gray-700 rounded animate-pulse align-middle"
            style={{ width: "4em", height: "1em" }}
          />
          まで
        </h2>
        <p className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 mb-4 flex items-end">
          <span
            className="inline-block bg-gray-200 dark:bg-gray-700 rounded animate-pulse align-bottom"
            style={{ width: "3.5em", height: "1em" }}
          />
          <span className="mx-1">/</span>
          <span
            className="inline-block bg-gray-200 dark:bg-gray-700 rounded animate-pulse align-bottom"
            style={{ width: "4.5em", height: "1em" }}
          />
          <span className="text-base font-medium text-gray-600 dark:text-gray-400 ml-2">日</span>
        </p>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <div
            className="bg-indigo-600 dark:bg-indigo-400 h-2.5 rounded-full animate-pulse"
            style={{ width: `40%` }}
          ></div>
        </div>
      </div>
    )
  }

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
        ></div>
      </div>
    </div>
  )
}

export default NextGrade
