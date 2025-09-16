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
      className="flex flex-row justify-between items-center mb-2 sm:mb-4 gap-2 "
      data-testid="month-navigation-container"
    >
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
    </div>
  )
}
