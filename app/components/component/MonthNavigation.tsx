import { style } from "~/styles/component"

type Props = {
  isChanged: boolean
  currentMonth: Date
  onPrev: () => void
  onNext: () => void
  onSelect: (date: Date) => void
  YearMonthSelector: React.ComponentType<{
    currentMonth: Date
    onSelect: (date: Date) => void
    isChanged: boolean
  }>
}

export default function MonthNavigation({
  isChanged,
  currentMonth,
  onPrev,
  onNext,
  onSelect,
  YearMonthSelector,
}: Props) {
  return (
    <div
      className="flex flex-row justify-between items-center mb-2 sm:mb-4 gap-2 "
      data-testid="month-navigation-container"
    >
      <button
        onClick={onPrev}
        className={style.button({
          type: "primary",
          className: "px-4 sm:px-6 py-2 sm:py-3 rounded-l-4xl",
        })}
        disabled={isChanged}
        data-testid="month-navigation-prev"
      >
        {`${currentMonth.getMonth()}月`}
      </button>
      <div
        className="flex items-center gap-2 mx-auto"
        data-testid="month-navigation-selector"
      >
        <YearMonthSelector
          currentMonth={currentMonth}
          onSelect={onSelect}
          isChanged={isChanged}
        />
      </div>
      <button
        onClick={onNext}
        className={style.button({
          type: "primary",
          className: "px-4 sm:px-6 py-2 sm:py-3 rounded-r-4xl",
        })}
        disabled={isChanged}
        data-testid="month-navigation-next"
      >
        {`${currentMonth.getMonth() + 2}月`}
      </button>
    </div>
  )
}
