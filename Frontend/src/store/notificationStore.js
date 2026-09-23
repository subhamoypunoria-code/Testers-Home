import { create } from 'zustand';
import { notificationAPI } from '../services/api';

const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,

  fetchNotifications: async () => {
    try {
      const { data } = await notificationAPI.getAll();
      set({ notifications: data.notifications, unreadCount: data.unreadCount });
    } catch {
      // ignore
    }
  },

  markRead: async (id) => {
    await notificationAPI.markRead(id);
    set({
      notifications: get().notifications.map(n => n._id === id ? { ...n, isRead: true } : n),
      unreadCount: Math.max(0, get().unreadCount - 1),
    });
  },

  markAllRead: async () => {
    await notificationAPI.markAllRead();
    set({ notifications: get().notifications.map(n => ({ ...n, isRead: true })), unreadCount: 0 });
  },

  addNotification: (n) => set({ notifications: [n, ...get().notifications], unreadCount: get().unreadCount + 1 }),

  delete: async (id) => {
    await notificationAPI.delete(id);
    const notif = get().notifications.find(n => n._id === id);
    set({
      notifications: get().notifications.filter(n => n._id !== id),
      unreadCount: notif && !notif.isRead ? get().unreadCount - 1 : get().unreadCount,
    });
  },
}));

export default useNotificationStore;
