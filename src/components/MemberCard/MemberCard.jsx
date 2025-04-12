import styles from './MemberCard.module.scss';

export default function MemberCard({ name, title, imageSrc }) {
    return (
        <div className={styles.card}>
            <img src={imageSrc} alt={name} className={styles.profilePic} />
            <div className={styles.textInfo}>
                <p className={styles.name}>{name}</p>
                <p className={styles.title}>{title}</p>
            </div>
        </div>
    );
}
