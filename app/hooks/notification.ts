import { create } from "zustand"

type NotificationType = "success" | "error" | "info"

export interface Notification {
  id: number
  title: string
  message: string
  type?: NotificationType
  duration?: number
}

interface NotificationStore {
  notifications: Notification[]
  showNotification: (notification: Omit<Notification, "id">) => void
  dismissNotification: (id: number) => void
}

let nextId = 0

export const useNotificationStore = create<NotificationStore>(set => ({
  notifications: [],
  showNotification: notification =>
    set(state => ({
      notifications: [...state.notifications, { ...notification, id: nextId++ }],
    })),
  dismissNotification: id =>
    set(state => ({
      notifications: state.notifications.filter(notification => notification.id !== id),
    })),
}))
