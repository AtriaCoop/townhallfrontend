import styles from './MessageBubble.module.scss';
import { formatRelativeTime, formatExactTime } from '@/utils/formateDatetime';

export default function MessageBubble({ avatar, sender, organization, timestamp, message }) {
  const relativeTime = timestamp ? formatRelativeTime(timestamp) : '';
  const exactTime = timestamp ? formatExactTime(timestamp) : '';

  return (
    <div className={styles.messageBubble}>
      <img src={avatar} alt={sender} className={styles.avatar} />
      <div className={styles.messageContent}>
        <div className={styles.meta}>
          <span className={styles.sender}>{sender}</span>
          {organization && <span className={styles.organization}> · {organization}</span>}
          <span className={styles.timestamp} title={exactTime}>{relativeTime}</span>
        </div>
        <div className={styles.messageText}>{message}</div>
      </div>
    </div>
  );
}
