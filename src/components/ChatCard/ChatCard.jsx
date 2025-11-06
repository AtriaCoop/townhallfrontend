import styles from './ChatCard.module.scss';
import { parse, formatDistanceToNow } from 'date-fns';
import Icon from '@/icons/Icon';


export default function ChatCard({ name, title, time, imageSrc, onDelete, hasNotification}) {
    const date = parse(time, "dd/MM/yyyy, HH:mm:ss", new Date());
    const formattedTime = formatDistanceToNow(date, { addSuffix: true });

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
                <p className={styles.name}>
                    {name}
                    {hasNotification && <span className={styles.badge} />}
                </p>
                <p className={styles.title}>{title}</p>
                <p className={styles.time}>{formattedTime}</p>
            </div>

            <button className={styles.button} onClick={onDelete}>
                <Icon name="trash" className={styles.icon}/>
            </button>
        </div>
    );
}
