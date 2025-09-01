import { Notification } from "./Notification"

import { useNotificationStore } from "~/hook/notification"

export function NotificationContainer() {
  const { notifications, dismissNotification } = useNotificationStore()

  return (
    <div className="fixed top-4 right-4 z-60 flex flex-col space-y-2">
      {notifications.map(n => (
        <Notification
          key={n.id}
          title={n.title}
          message={n.message}
          type={n.type}
          duration={n.duration}
          onClose={() => dismissNotification(n.id)}
        />
      ))}
    </div>
  )
}
