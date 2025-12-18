type Props = {
  isChanged: boolean
  currentMonth: Date
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
  onSelect,
  YearMonthSelector,
}: Props) {
  return (
    <div
      className="mb-2 flex flex-row items-center justify-between gap-2 sm:mb-4"
      data-testid="month-navigation-container"
    >
      <div
        className="mx-auto flex items-center gap-2"
        data-testid="month-navigation-selector"
      >
        <YearMonthSelector
          currentMonth={currentMonth}
          onSelect={onSelect}
          isChanged={isChanged}
        />
      </div>
    </div>
  )
}
