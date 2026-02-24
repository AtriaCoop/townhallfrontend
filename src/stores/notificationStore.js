import { create } from 'zustand';

const useNotificationStore = create((set) => ({
  // Bell icon (general notifications)
  notifications: [],
  unreadCount: 0,
  bellDropdownOpen: false,

  // Message icon (DM unread)
  hasNewDm: false,
  unreadDmMap: {},

  // Bell icon actions
  setNotifications: (notifications) => set({ notifications }),

  setUnreadCount: (count) => set({ unreadCount: count }),

  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications].slice(0, 50),
      unreadCount: state.unreadCount + 1,
    })),

  markAllRead: () =>
    set((state) => ({
      unreadCount: 0,
      notifications: state.notifications.map((n) => ({
        ...n,
        is_read: true,
      })),
    })),

  markOneRead: (notificationId) =>
    set((state) => {
      const target = state.notifications.find((n) => n.id === notificationId);
      const wasUnread = target && !target.is_read;
      return {
        unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
        notifications: state.notifications.map((n) =>
          n.id === notificationId ? { ...n, is_read: true } : n
        ),
      };
    }),

  toggleBellDropdown: () =>
    set((state) => ({ bellDropdownOpen: !state.bellDropdownOpen })),

  closeBellDropdown: () => set({ bellDropdownOpen: false }),

  // DM actions
  setHasNewDm: (value) => set({ hasNewDm: value }),

  addUnreadDm: (chatId) =>
    set((state) => ({
      hasNewDm: true,
      unreadDmMap: {
        ...state.unreadDmMap,
        [chatId]: (state.unreadDmMap[chatId] || 0) + 1,
      },
    })),

  clearUnreadDm: (chatId) =>
    set((state) => {
      const newMap = { ...state.unreadDmMap };
      delete newMap[chatId];
      const anyUnread = Object.keys(newMap).length > 0;
      return {
        unreadDmMap: newMap,
        hasNewDm: anyUnread,
      };
    }),

  setUnreadDmMap: (map) => set({ unreadDmMap: map }),

  clearAllUnreadDm: () => set({ hasNewDm: false, unreadDmMap: {} }),
}));

export default useNotificationStore;
