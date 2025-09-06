import React, { useCallback } from "react"
import { toast } from "sonner"

interface NotificationProps {
  title: string
  message: string
  type?: "success" | "error" | "info"
  duration?: number
}

export function Notification({
  title,
  message,
  type = "info",
  duration = 5000,
}: NotificationProps) {
  const showToast = useCallback(() => {
    switch (type) {
      case "success":
        toast.success(title, { description: message, duration })
        break
      case "error":
        toast.error(title, { description: message, duration })
        break
      case "info":
      default:
        toast.info(title, { description: message, duration })
        break
    }
  }, [type, title, message, duration])

  // Automatically show the toast when component mounts
  React.useEffect(() => {
    showToast()
  }, [showToast])

  return null // Sonner handles rendering
}
