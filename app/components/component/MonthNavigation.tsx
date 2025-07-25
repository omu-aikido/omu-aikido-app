import { style } from "~/styles/component"

type Props = {
  currentMonth: Date
  onPrev: () => void
  onNext: () => void
  onSelect: (date: Date) => void
  YearMonthSelector: React.ComponentType<{
    currentMonth: Date
    onSelect: (date: Date) => void
  }>
}

export default function MonthNavigation({
  currentMonth,
  onPrev,
  onNext,
  onSelect,
  YearMonthSelector,
}: Props) {
  return (
    <div className="flex flex-row justify-between items-center mb-2 sm:mb-4 gap-2 ">
      <button
        onClick={onPrev}
        className={style.button({
          type: "primary",
          className: "px-4 sm:px-6 py-2 sm:py-3 rounded-l-4xl",
        })}
      >
        {`${currentMonth.getMonth()}月`}
      </button>
      <div className="flex items-center gap-2 mx-auto">
        <YearMonthSelector currentMonth={currentMonth} onSelect={onSelect} />
      </div>
      <button
        onClick={onNext}
        className={style.button({
          type: "primary",
          className: "px-4 sm:px-6 py-2 sm:py-3 rounded-r-4xl",
        })}
      >
        {`${currentMonth.getMonth() + 2}月`}
      </button>
    </div>
  )
}
