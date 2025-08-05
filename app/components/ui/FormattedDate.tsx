import React from "react"

interface FormattedDateProps {
  date: Date | number | string | unknown
}

const FormattedDate = React.memo<FormattedDateProps>(function FormattedDate({ date }) {
  const parsedDate = React.useMemo(() => {
    if (date instanceof Date) return date
    if (typeof date === "number") return new Date(date)
    if (typeof date === "string") {
      const num = Number(date)
      return !isNaN(num) ? new Date(num) : new Date(date)
    }
    return new Date(date as string)
  }, [date])

  return (
    <time dateTime={parsedDate.toISOString()}>
      {parsedDate.toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })}
    </time>
  )
})

export default FormattedDate
