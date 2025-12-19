import { style } from "@/app/styles/component" // Import style

interface Props {
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
      disabled={submitting || isChanged}
      className={style.button({
        type: isChanged ? "primary" : "secondary", // Dynamically set type based on isChanged
        className,
      })}
      data-testid="batch-update-button"
    >
      {children}
    </button>
  )
}
