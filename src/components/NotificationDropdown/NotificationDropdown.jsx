import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { authenticatedFetch } from '@/utils/authHelpers';
import useNotificationStore from '@/stores/notificationStore';
import styles from './NotificationDropdown.module.scss';

function getNotificationText(n) {
  switch (n.notification_type) {
    case 'reaction':
      return `reacted ${n.detail || ''} to your post`;
    case 'comment':
      return 'commented on your post';
    case 'like':
      return 'liked your post';
    case 'new_event':
      return `created a new event: ${n.detail}`;
    case 'event_update':
      return `updated event: ${n.detail}`;
    case 'event_cancel':
      return `canceled event: ${n.detail}`;
    case 'event_reminder':
      return `Reminder: ${n.detail} is coming up`;
    default:
      return 'sent you a notification';
  }
}

function getNotificationLink(n) {
  switch (n.notification_type) {
    case 'reaction':
    case 'comment':
    case 'like':
      return '/DashboardPage';
    case 'new_event':
    case 'event_update':
    case 'event_reminder':
    case 'event_cancel':
      return '/EventsPage';
    default:
      return '/DashboardPage';
  }
}

function timeAgo(dateString) {
  const seconds = Math.floor((Date.now() - new Date(dateString)) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateString).toLocaleDateString();
}

export default function NotificationDropdown() {
  const router = useRouter();
  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE || '';

  const notifications = useNotificationStore((s) => s.notifications);
  const setNotifications = useNotificationStore((s) => s.setNotifications);
  const setUnreadCount = useNotificationStore((s) => s.setUnreadCount);
  const markAllRead = useNotificationStore((s) => s.markAllRead);
  const markOneRead = useNotificationStore((s) => s.markOneRead);
  const closeBellDropdown = useNotificationStore((s) => s.closeBellDropdown);

  // Fetch full notification list when dropdown opens
  useEffect(() => {
    authenticatedFetch(`${BASE_URL}/notifications/`)
      .then((res) => res.json())
      .then((data) => {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unread_count || 0);
      })
      .catch(() => {});
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await authenticatedFetch(`${BASE_URL}/notifications/mark-all-read/`, {
        method: 'POST',
      });
      markAllRead();
    } catch {
      // Network error — leave UI unchanged
    }
  };

  const handleNotificationClick = (n) => {
    if (!n.is_read) {
      authenticatedFetch(`${BASE_URL}/notifications/${n.id}/mark-read/`, {
        method: 'POST',
      }).catch(() => {});
      markOneRead(n.id);
    }
    closeBellDropdown();
    router.push(getNotificationLink(n));
  };

  return (
    <div className={styles.dropdown}>
      <div className={styles.header}>
        <span className={styles.title}>Notifications</span>
        {notifications.some((n) => !n.is_read) && (
          <button
            className={styles.markAllButton}
            onClick={handleMarkAllRead}
          >
            Mark all read
          </button>
        )}
      </div>

      <div className={styles.list}>
        {notifications.length === 0 ? (
          <div className={styles.empty}>
            <p>No notifications yet</p>
          </div>
        ) : (
          notifications.map((n) => (
            <button
              key={n.id}
              className={`${styles.item} ${!n.is_read ? styles.unread : ''}`}
              onClick={() => handleNotificationClick(n)}
            >
              <img
                src={
                  n.actor?.profile_image || '/assets/ProfileImage.jpg'
                }
                alt=""
                className={styles.avatar}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/assets/ProfileImage.jpg';
                }}
              />
              <div className={styles.body}>
                <p className={styles.text}>
                  <strong>{n.actor?.full_name || 'System'}</strong>{' '}
                  {getNotificationText(n)}
                </p>
                <span className={styles.time}>{timeAgo(n.created_at)}</span>
              </div>
              {!n.is_read && <span className={styles.unreadDot} />}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
