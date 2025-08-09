import { useRef } from "react"

import { translateGrade } from "~/lib/utils"
import { style } from "~/styles/component"

export function NextGrade(gradeData: {
  grade: number
  needToNextGrade: number
  forNextGrade: number
}) {
  const { grade, needToNextGrade, forNextGrade } = gradeData

  const targetGrade = grade < 0 ? grade - 1 : grade > 0 ? grade - 2 : 5
  const promotionType = grade <= 1 ? (grade === 0 ? "昇級" : "昇段") : "昇級"
  const progressPercentage = ((forNextGrade - needToNextGrade) / forNextGrade) * 100

  const detailsRef = useRef<HTMLDetailsElement>(null)

  const handleClose = () => {
    if (detailsRef.current) {
      detailsRef.current.open = false
    }
  }

  // 進捗率に応じたコメント
  const progressComments = [
    "まだ始まったばかりです。焦らずコツコツ続けましょう！",
    "少し進みました！この調子！",
    "順調なスタートです。",
    "良いペースです。",
    "着実に積み重ねています。",
    "半分近くまで来ました！",
    "折り返し地点です。",
    "後半戦、集中していきましょう！",
    "ゴールが見えてきました。",
    "あと少しで達成です！",
    "もうすぐ目標達成！",
    "素晴らしい！達成目前です。",
  ]
  const commentIndex = Math.min(11, Math.floor((progressPercentage / 100) * 12))
  const progressComment = progressComments[commentIndex]

  return (
    <details
      ref={detailsRef}
      className={style.card.container({ class: "select-none pb-0 group" })}
    >
      <summary className="block">
        <div className="flex flex-row items-center justify-center gap-2 mb-4">
          <h2 className={style.text.sectionTitle({ class: "text-xl mb-0 mt-0.5" })}>
            {translateGrade(targetGrade)}
            {promotionType}まで
          </h2>
          <p className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
            {needToNextGrade}
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
        <div className="flex flex-col items-center mt-4 cursor-pointer group-open:hidden">
          <div className="w-12 h-0.5 rounded-full bg-gray-300 dark:bg-gray-600 mb-0.5" />
          <div className="w-12 h-0.5 rounded-full bg-gray-300 dark:bg-gray-600 mb-0.5" />
        </div>
      </summary>
      <p className="mt-5 mb-2 border border-slate-500 p-2 rounded-md">
        {progressComment}
        <br />
        目標の{translateGrade(targetGrade)}への{promotionType}まで
        <strong className="text-indigo-600 dark:text-indigo-400">
          {forNextGrade}日分
        </strong>
        の稽古が必要ですが、すでに
        <strong className="text-green-600 dark:text-green-400">
          {forNextGrade - needToNextGrade}日
        </strong>
        達成しています。
        <br />
        稽古は1.5時間で１日分としてカウントされます。
      </p>
      <div
        className="flex flex-col items-center mt-4 cursor-pointer"
        onClick={handleClose}
        tabIndex={0}
        role="button"
        aria-label="閉じる"
        onKeyDown={e => {
          if (e.key === "Enter" || e.key === " ") handleClose()
        }}
      >
        <div className="w-12 h-0.5 rounded-full bg-gray-300 dark:bg-gray-600 mb-0.5" />
        <div className="w-12 h-0.5 rounded-full bg-gray-300 dark:bg-gray-600 mb-0.5" />
      </div>
    </details>
  )
}
