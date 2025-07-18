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
        className="bg-blue-400 hover:bg-blue-600 dark:bg-blue-500 dark:hover:bg-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors duration-200 shadow-sm"
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
        className="bg-blue-400 hover:bg-blue-600 dark:bg-blue-500 dark:hover:bg-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors duration-200 shadow-sm"
      >
        次月 →
      </button>
    </div>
  )
}
