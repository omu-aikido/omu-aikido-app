import { style } from "~/styles/component" // Import style

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
      className={style.button.default({
        disabled: !isChanged || submitting,
        type: isChanged ? "primary" : "secondary", // Dynamically set type based on isChanged
        className,
      })}
    >
      {children}
    </button>
  )
}
