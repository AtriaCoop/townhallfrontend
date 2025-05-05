import styles from './MemberCard.module.scss';

export default function MemberCard({ name, title, imageSrc, onClick }) {
    return (
        <div className={styles.card} onClick={onClick}>
            <img src={imageSrc} alt={name} className={styles.profilePic} />
            <div className={styles.textInfo}>
                <p className={styles.name}>{name}</p>
                <p className={styles.title}>{title}</p>
            </div>
        </div>
    );
}
