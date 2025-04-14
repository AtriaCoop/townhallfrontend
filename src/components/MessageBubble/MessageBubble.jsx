import styles from './MessageBubble.module.scss';

export default function MessageBubble({ avatar, sender, organization, timestamp, message }) {
  return (
    <div className={styles.messageBubble}>
      <img src={avatar} alt={sender} className={styles.avatar} />
      <div>
        <p className={styles.sender}>
          <strong>{sender}</strong> - {organization} - <span className={styles.timestamp}>{timestamp}</span>
        </p>
        <p className={styles.messageText}>{message}</p>
      </div>
    </div>
  );
}
