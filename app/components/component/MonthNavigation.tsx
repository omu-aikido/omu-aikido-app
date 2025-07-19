import { style } from "~/styles/component"

type Props = {
  currentMonth: Date
  onPrev: () => void
  onNext: () => void
  onSelect: (date: Date) => void
  YearMonthSelector: React.ComponentType<{ currentMonth: Date; onSelect: (date: Date) => void }>
}

export default function MonthNavigation({
  currentMonth,
  onPrev,
  onNext,
  onSelect,
  YearMonthSelector,
}: Props) {
  return (
    <div className="flex flex-row justify-between items-center mb-4 sm:mb-8 gap-2">
      <button
        onClick={onPrev}
        className={style.button.default({
          type: "primary",
          className: "px-4 sm:px-6 py-2 sm:py-3",
        })}
      >
        ← 前月
      </button>
      <div className="flex items-center gap-2">
        <div className="flex items-center px-3 py-2">
          <YearMonthSelector currentMonth={currentMonth} onSelect={onSelect} />
        </div>
      </div>
      <button
        onClick={onNext}
        className={style.button.default({
          type: "primary",
          className: "px-4 sm:px-6 py-2 sm:py-3",
        })}
      >
        次月 →
      </button>
    </div>
  )
}
