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
      className={style.card.container({ class: "group pb-0 select-none" })}
      data-testid="next-grade-container"
    >
      <summary className="block" data-testid="next-grade-summary">
        <div
          className="mb-4 flex flex-row items-center justify-center gap-2"
          data-testid="next-grade-header"
        >
          <h2
            className={style.text.sectionTitle({ class: "mt-0.5 mb-0 text-xl" })}
            data-testid="next-grade-title"
          >
            {translateGrade(targetGrade)}
            {promotionType}まで
          </h2>
          <p
            className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400"
            data-testid="next-grade-days-needed"
          >
            {needToNextGrade}
          </p>
          <span className="mt-1 text-base font-medium text-gray-600 dark:text-gray-400">
            日
          </span>
        </div>
        <div
          className="h-2.5 w-full rounded-full bg-gray-200 dark:bg-gray-700"
          data-testid="next-grade-progress-container"
        >
          <div
            className="h-2.5 rounded-full bg-indigo-600 dark:bg-indigo-400"
            style={{ width: `${progressPercentage}%` }}
            data-testid="next-grade-progress-bar"
          />
        </div>
        <div
          className="mt-4 flex cursor-pointer flex-col items-center group-open:hidden"
          data-testid="next-grade-expand-indicator"
        >
          <div className="mb-0.5 h-0.5 w-12 rounded-full bg-gray-300 dark:bg-gray-600" />
          <div className="mb-0.5 h-0.5 w-12 rounded-full bg-gray-300 dark:bg-gray-600" />
        </div>
      </summary>
      <p
        className="mt-5 mb-2 rounded-md border border-slate-500 p-2"
        data-testid="next-grade-details"
      >
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
        className="mt-4 flex cursor-pointer flex-col items-center"
        onClick={handleClose}
        tabIndex={0}
        role="button"
        aria-label="閉じる"
        onKeyDown={e => {
          if (e.key === "Enter" || e.key === " ") handleClose()
        }}
        data-testid="next-grade-close-button"
      >
        <div className="mb-0.5 h-0.5 w-12 rounded-full bg-gray-300 dark:bg-gray-600" />
        <div className="mb-0.5 h-0.5 w-12 rounded-full bg-gray-300 dark:bg-gray-600" />
      </div>
    </details>
  )
}
