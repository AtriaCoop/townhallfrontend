import { useRouter } from 'next/router';
import Icon from '@/icons/Icon';
import styles from './LikeModal.module.scss';

export default function LikeModal({ onClose, liked_by = [] }) {
  const router = useRouter();

  const handleUserClick = (userId) => {
    onClose();
    router.push(`/ProfilePage/${userId}`);
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Likes</h2>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close">
            <Icon name="close" size={20} />
          </button>
        </div>

        <div className={styles.userList}>
          {liked_by.length === 0 ? (
            <div className={styles.emptyState}>
              <Icon name="heart" size={32} />
              <p>No likes yet</p>
            </div>
          ) : (
            liked_by.map((user) => (
              <div
                key={user.id}
                className={styles.userItem}
                onClick={() => handleUserClick(user.id)}
              >
                <img
                  src={user.profile_image || '/assets/ProfileImage.jpg'}
                  alt={user.full_name}
                  className={styles.userAvatar}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/assets/ProfileImage.jpg';
                  }}
                />
                <div className={styles.userInfo}>
                  <span className={styles.userName}>{user.full_name}</span>
                  {user.primary_organization && (
                    <span className={styles.userOrg}>{user.primary_organization}</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
