import styles from './ChatCard.module.scss';

export default function ChatCard({ name, title, time, imageSrc }) {
    return (
        <div className={styles.card}>
            <img src={imageSrc} alt={name} className={styles.profilePic} />
            <div className={styles.textInfo}>
                <p className={styles.name}>{name}</p>
                <p className={styles.title}>{title}</p>
                <p className={styles.time}>{time}</p>
            </div>

            <button className={styles.button}>Delete Conversation</button>
        </div>
    );
}
