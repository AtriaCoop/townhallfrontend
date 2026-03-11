import { useRouter } from 'next/router';
import styles from './MessageBubble.module.scss';
import { formatRelativeTime, formatExactTime } from '@/utils/formateDatetime';

export default function MessageBubble({ avatar, sender, senderId, organization, timestamp, message }) {
  const router = useRouter();
  const relativeTime = timestamp ? formatRelativeTime(timestamp) : '';
  const exactTime = timestamp ? formatExactTime(timestamp) : '';

  const handleProfileClick = () => {
    if (senderId) router.push(`/ProfilePage/${senderId}`);
  };

  return (
    <div className={styles.messageBubble}>
      <img
        src={avatar}
        alt={sender}
        className={`${styles.avatar} ${senderId ? styles.clickable : ''}`}
        onClick={handleProfileClick}
      />
      <div className={styles.messageContent}>
        <div className={styles.meta}>
          <span
            className={`${styles.sender} ${senderId ? styles.clickable : ''}`}
            onClick={handleProfileClick}
          >
            {sender}
          </span>
          {organization && <span className={styles.organization}> · {organization}</span>}
          <span className={styles.timestamp} title={exactTime}>{relativeTime}</span>
        </div>
        <div className={styles.messageText}>{message}</div>
      </div>
    </div>
  );
}
