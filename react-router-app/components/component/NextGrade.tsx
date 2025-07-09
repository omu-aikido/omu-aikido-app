import { translateGrade } from "@/src/utils"

const NextGrade = ({
  grade,
  needToNextGrade,
  nextGrade,
}: {
  grade: number
  needToNextGrade: number
  nextGrade: number
}) => {
  if (grade <= 0) return null

  const targetGrade = grade >= 0 ? grade - 2 : grade - 1
  const promotionType = grade <= 1 ? (grade === 0 ? "昇級" : "昇段") : "昇級"

  return (
    <>
      <h2>
        {translateGrade(targetGrade)}{promotionType}まで
      </h2>
      <p>
        {needToNextGrade} / {nextGrade} 日
      </p>
    </>
  )
}

export default NextGrade
