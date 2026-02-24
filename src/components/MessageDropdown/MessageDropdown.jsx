import { useRouter } from 'next/router';
import useNotificationStore from '@/stores/notificationStore';
import styles from './MessageDropdown.module.scss';

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

export default function MessageDropdown() {
  const router = useRouter();

  const unreadDmMap = useNotificationStore((s) => s.unreadDmMap);
  const dmPreviews = useNotificationStore((s) => s.dmPreviews);
  const clearUnreadDm = useNotificationStore((s) => s.clearUnreadDm);
  const clearAllUnreadDm = useNotificationStore((s) => s.clearAllUnreadDm);
  const closeMessageDropdown = useNotificationStore((s) => s.closeMessageDropdown);

  // Build list of unread conversations from previews
  const unreadChats = Object.keys(unreadDmMap)
    .filter((chatId) => dmPreviews[chatId])
    .map((chatId) => ({
      chatId,
      count: unreadDmMap[chatId],
      ...dmPreviews[chatId],
    }))
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const handleMessageClick = (chat) => {
    clearUnreadDm(chat.chatId);
    closeMessageDropdown();
    router.push(`/DirectMessagesPage?chatWith=${chat.senderId}`);
  };

  const handleMarkAllRead = () => {
    clearAllUnreadDm();
  };

  const handleViewAll = () => {
    closeMessageDropdown();
    router.push('/DirectMessagesPage');
  };

  return (
    <div className={styles.dropdown}>
      <div className={styles.header}>
        <span className={styles.title}>Messages</span>
        {unreadChats.length > 0 && (
          <button className={styles.markAllButton} onClick={handleMarkAllRead}>
            Mark all read
          </button>
        )}
      </div>

      <div className={styles.list}>
        {unreadChats.length === 0 ? (
          <div className={styles.empty}>
            <p>No new messages</p>
          </div>
        ) : (
          unreadChats.map((chat) => (
            <button
              key={chat.chatId}
              className={styles.item}
              onClick={() => handleMessageClick(chat)}
            >
              <img
                src={chat.senderImage || '/assets/ProfileImage.jpg'}
                alt=""
                className={styles.avatar}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/assets/ProfileImage.jpg';
                }}
              />
              <div className={styles.body}>
                <p className={styles.text}>
                  <strong>{chat.senderName}</strong>{' '}
                  {chat.lastMessage || 'sent you a message'}
                </p>
                <span className={styles.time}>{timeAgo(chat.timestamp)}</span>
              </div>
              {chat.count > 1 && (
                <span className={styles.countBadge}>{chat.count}</span>
              )}
              <span className={styles.unreadDot} />
            </button>
          ))
        )}
      </div>

      <div className={styles.footer}>
        <button className={styles.viewAllButton} onClick={handleViewAll}>
          View all messages
        </button>
      </div>
    </div>
  );
}
