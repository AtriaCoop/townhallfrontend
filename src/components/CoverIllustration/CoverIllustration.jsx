import styles from "./CoverIllustration.module.scss";

export default function CoverIllustration({ className }) {
  return (
    <div className={[styles.coverImage, className].filter(Boolean).join(" ")}> 
    <div className={styles.coverIllustration}>
      <div className={styles.coverOverlay} />
      <svg viewBox="0 0 200 100" className={styles.silhouettes}>
        <circle cx="50" cy="40" r="15" fill="currentColor" opacity="0.3" />
        <path d="M35 100 Q50 60 65 100" fill="currentColor" opacity="0.3" />
        <circle cx="100" cy="35" r="18" fill="currentColor" opacity="0.4" />
        <path d="M80 100 Q100 55 120 100" fill="currentColor" opacity="0.4" />
        <circle cx="150" cy="40" r="15" fill="currentColor" opacity="0.3" />
        <path d="M135 100 Q150 60 165 100" fill="currentColor" opacity="0.3" />
      </svg>
    </div>
    </div>
  );
}