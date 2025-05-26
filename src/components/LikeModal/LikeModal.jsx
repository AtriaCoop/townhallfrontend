import styles from './LikeModal.module.scss';

export default function LikeModal({ onClose, liked_by = [], BASE_URL }) {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={onClose}>×</button>
        <h1>Who Liked The Post</h1>

        <div className={styles.userList}>
          {liked_by.length === 0 ? (
            <p>No liked_by yet.</p>
          ) : (
            liked_by.map(user => (
              <div key={user.id} className={styles.userItem}>
                <img
                  src={`${BASE_URL}${user.profile_image || '/assets/ProfileImage.jpg'}`}
                  alt="User"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/assets/ProfileImage.jpg';
                  }}
                />
                <div>
                  <strong>{user.full_name}</strong>
                  <p>{user.primary_organization}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
