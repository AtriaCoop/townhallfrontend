import styles from './ChatCard.module.scss';
import { formatDistanceToNow } from 'date-fns';

export default function ChatCard({ name, title, time, imageSrc, onDelete }) {

    const formattedTime = formatDistanceToNow(new Date(time), { addSuffix: true });

    return (
        <div className={styles.card}>
            <img
            src={imageSrc}
            alt="Profile"
            className={styles.profilePic}
            onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/assets/ProfileImage.jpg";
            }}
            />
            <div className={styles.textInfo}>
                <p className={styles.name}>{name}</p>
                <p className={styles.title}>{title}</p>
                <p className={styles.time}>{formattedTime}</p>
            </div>

            <button className={styles.button} onClick={onDelete}>
                Delete Conversation
            </button>
        </div>
    );
}
