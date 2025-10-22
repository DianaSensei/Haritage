import { Notification } from '@/shared/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
}

interface NotificationActions {
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateUnreadCount: () => void;
}

type NotificationStore = NotificationState & NotificationActions;

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      // Initial state
      notifications: [],
      unreadCount: 0,
      isLoading: false,
      error: null,

      // Actions
      setNotifications: (notifications) => {
        const unreadCount = notifications.filter(n => !n.isRead).length;
        set({ notifications, unreadCount });
      },
      
      addNotification: (notification) => {
        const notifications = get().notifications;
        // If a notification with the same id already exists, update it and move to front
        const exists = notifications.find(n => n.id === notification.id);
        let updatedNotifications;
        if (exists) {
          // replace existing with incoming (preserve order by moving to front)
          const filtered = notifications.filter(n => n.id !== notification.id);
          updatedNotifications = [ { ...exists, ...notification }, ...filtered ];
        } else {
          updatedNotifications = [notification, ...notifications];
        }
        const unreadCount = updatedNotifications.filter(n => !n.isRead).length;
        set({ notifications: updatedNotifications, unreadCount });
      },
      
      markAsRead: (id) => {
        const notifications = get().notifications;
        const updatedNotifications = notifications.map(notification =>
          notification.id === id ? { ...notification, isRead: true } : notification
        );
        const unreadCount = updatedNotifications.filter(n => !n.isRead).length;
        set({ notifications: updatedNotifications, unreadCount });
      },
      
      markAllAsRead: () => {
        const notifications = get().notifications;
        const updatedNotifications = notifications.map(notification => ({
          ...notification,
          isRead: true
        }));
        set({ notifications: updatedNotifications, unreadCount: 0 });
      },
      
      removeNotification: (id) => {
        const notifications = get().notifications;
        const updatedNotifications = notifications.filter(n => n.id !== id);
        const unreadCount = updatedNotifications.filter(n => !n.isRead).length;
        set({ notifications: updatedNotifications, unreadCount });
      },
      
      clearAllNotifications: () => set({ 
        notifications: [], 
        unreadCount: 0 
      }),
      
      setLoading: (isLoading) => set({ isLoading }),
      
      setError: (error) => set({ error }),
      
      updateUnreadCount: () => {
        const notifications = get().notifications;
        const unreadCount = notifications.filter(n => !n.isRead).length;
        set({ unreadCount });
      },
    }),
    {
      name: 'notification-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ 
        notifications: state.notifications,
        unreadCount: state.unreadCount
      }),
    }
  )
);
