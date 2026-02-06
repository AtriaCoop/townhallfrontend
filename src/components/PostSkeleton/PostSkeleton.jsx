import styles from './PostSkeleton.module.scss';

export default function PostSkeleton({ count = 3 }) {
  return (
    <div className={styles.skeletonList}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={styles.skeletonPost}>
          {/* Header */}
          <div className={styles.skeletonHeader}>
            <div className={styles.skeletonAvatar} />
            <div className={styles.skeletonInfo}>
              <div className={styles.skeletonName} />
              <div className={styles.skeletonOrg} />
              <div className={styles.skeletonDate} />
            </div>
          </div>
          {/* Content */}
          <div className={styles.skeletonContent}>
            <div className={styles.skeletonLine} />
            <div className={styles.skeletonLine} style={{ width: '85%' }} />
            <div className={styles.skeletonLine} style={{ width: '60%' }} />
          </div>
          {/* Footer */}
          <div className={styles.skeletonFooter}>
            <div className={styles.skeletonAction} />
            <div className={styles.skeletonAction} />
            <div className={styles.skeletonAction} />
          </div>
        </div>
      ))}
    </div>
  );
}
