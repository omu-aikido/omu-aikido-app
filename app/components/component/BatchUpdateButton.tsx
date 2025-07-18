type Props = {
  isChanged: boolean
  submitting: boolean
  className?: string
  children: React.ReactNode
}

export default function BatchUpdateButton({
  isChanged,
  submitting,
  className = "",
  children,
}: Props) {
  return (
    <button
      type="submit"
      className={`rounded-lg font-medium transition-colors duration-200 shadow-sm ${isChanged ? "bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white" : "bg-gray-300 dark:bg-gray-700 text-gray-400 cursor-not-allowed"} ${className}`}
      disabled={!isChanged || submitting}
    >
      {children}
    </button>
  )
}
