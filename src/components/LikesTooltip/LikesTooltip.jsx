import { useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from './LikesTooltip.module.scss';

const MAX_VISIBLE = 5;

export default function LikesTooltip({ liked_by = [], onClose }) {
  const router = useRouter();
  const tooltipRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target)) {
        onClose?.();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleUserClick = (userId) => {
    onClose?.();
    router.push(`/ProfilePage/${userId}`);
  };

  const visibleUsers = liked_by.slice(0, MAX_VISIBLE);
  const remainingCount = liked_by.length - MAX_VISIBLE;

  if (liked_by.length === 0) {
    return (
      <div className={styles.tooltip} ref={tooltipRef}>
        <p className={styles.emptyText}>No likes yet</p>
      </div>
    );
  }

  return (
    <div className={styles.tooltip} ref={tooltipRef}>
      <div className={styles.userList}>
        {visibleUsers.map((user) => (
          <div
            key={user.id}
            className={styles.userItem}
            onClick={() => handleUserClick(user.id)}
          >
            <img
              src={user.profile_image || '/assets/ProfileImage.jpg'}
              alt={user.full_name}
              className={styles.avatar}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/assets/ProfileImage.jpg';
              }}
            />
            <span className={styles.userName}>{user.full_name}</span>
          </div>
        ))}
        {remainingCount > 0 && (
          <div className={styles.moreText}>
            and {remainingCount} other{remainingCount !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
}
