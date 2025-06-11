import styles from './MessageBubble.module.scss';

export default function MessageBubble({ avatar, sender, organization, timestamp, message }) {
  return (
    <div className={styles.messageBubble}>
      <img src={avatar} alt={sender} className={styles.avatar} />
      <div className={styles.messageContent}>
        <div className={styles.meta}>
          <span className={styles.sender}>{sender}</span>
          {organization && <span className={styles.organization}> · {organization}</span>}
          <span className={styles.timestamp}>{timestamp}</span>
        </div>
        <p className={styles.messageText}>{message}</p>
      </div>
    </div>
  );
}
