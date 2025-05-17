import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AppState {
  theme: 'light' | 'dark'
  setTheme: (theme: 'light' | 'dark') => void
  isLoading: boolean
  setIsLoading: (isLoading: boolean) => void
  notifications: Notification[]
  addNotification: (notification: Notification) => void
  removeNotification: (id: string) => void
}

interface Notification {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  message: string
  duration?: number
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      theme: 'light',
      setTheme: (theme) => set({ theme }),
      isLoading: false,
      setIsLoading: (isLoading) => set({ isLoading }),
      notifications: [],
      addNotification: (notification) =>
        set((state) => ({
          notifications: [...state.notifications, notification],
        })),
      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),
    }),
    {
      name: 'app-storage',
    }
  )
) 