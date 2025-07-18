import { useEffect } from "react"

interface NotificationProps {
  title: string
  message: string
  type?: "success" | "error" | "info"
  duration?: number
  onClose: () => void
}

export function Notification({
  title,
  message,
  type = "info",
  duration = 5000,
  onClose,
}: NotificationProps) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  const typeClasses = {
    success: "bg-green-500",
    error: "bg-red-500",
    info: "bg-blue-500",
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="notification-item relative animate-slide-in w-80 rounded-lg border border-slate-400 bg-slate-200 p-4 shadow-lg dark:border-slate-600 dark:bg-slate-800">
        <span className="absolute -top-1 -left-1">
          <span
            className={`notification-dot absolute inline-flex size-3 animate-ping rounded-full opacity-75 ${typeClasses[type]}`}
          />
          <span
            className={`notification-dot absolute inline-flex size-3 rounded-full ${typeClasses[type]}`}
          />
        </span>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="close-button text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
          >
            ✕
          </button>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400">{message}</p>
      </div>
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slideIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  )
}
