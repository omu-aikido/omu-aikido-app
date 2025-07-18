import React from "react"

interface FormattedDateProps {
  date: Date | number | string | unknown
}

const FormattedDate: React.FC<FormattedDateProps> = ({ date }) => {
  const parsedDate = (() => {
    if (date instanceof Date) return date
    if (typeof date === "number") return new Date(date)
    if (typeof date === "string") {
      const num = Number(date)
      return !isNaN(num) ? new Date(num) : new Date(date)
    }
    return new Date(date as string)
  })()

  return (
    <time dateTime={parsedDate.toISOString()}>
      {parsedDate.toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })}
    </time>
  )
}

export default FormattedDate
