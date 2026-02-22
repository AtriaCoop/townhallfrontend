import styles from './ChatModal.module.scss';
import { useState, useEffect } from 'react';
import Icon from '@/icons/Icon';

export default function Modal({
  title,
  currUserId,
  onClose,
  onUserSelect,
}) {
  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE || '';
  const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUD_ID;

  const [users, setUsers] = useState([]);
  const [searchUsers, setSearchUsers] = useState('');

  const filteredUsers = users
    .filter((user) =>
      user.full_name &&
      user.full_name.toLowerCase().includes(searchUsers.toLowerCase()) &&
      user.id != currUserId
    )
    .sort((a, b) => a.full_name.toLowerCase().localeCompare(b.full_name.toLowerCase()));

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await fetch(`${BASE_URL}/user`);
        const data = await response.json();
        setUsers(data.data || []);
      } catch (error) {
        console.error("Error fetching user data", error);
      }
    }
    fetchUsers();
  }, [BASE_URL]);

  const getProfileImage = (user) => {
    if (!user.profile_image) return '/assets/ProfileImage.jpg';
    if (user.profile_image.startsWith('http')) return user.profile_image;
    if (CLOUD_NAME) return `https://res.cloudinary.com/${CLOUD_NAME}/${user.profile_image}`;
    return '/assets/ProfileImage.jpg';
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>{title}</h2>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close">
            <Icon name="close" size={20} />
          </button>
        </div>

        <p className={styles.subtitle}>Choose someone to start a new conversation</p>

        <div className={styles.searchWrapper}>
          <Icon name="search" size={16} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search members..."
            className={styles.searchInput}
            value={searchUsers}
            onChange={(e) => setSearchUsers(e.target.value)}
          />
        </div>

        <div className={styles.userList}>
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <div key={user.id} className={styles.userItem} onClick={() => onUserSelect(user)}>
                <img
                  src={getProfileImage(user)}
                  alt={user.full_name}
                  className={styles.userAvatar}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/assets/ProfileImage.jpg';
                  }}
                />
                <div className={styles.userInfo}>
                  <span className={styles.userName}>{user.full_name}</span>
                  {user.title && <span className={styles.userTitle}>{user.title}</span>}
                </div>
              </div>
            ))
          ) : (
            <p className={styles.noResults}>No members found matching your search.</p>
          )}
        </div>
      </div>
    </div>
  );
}
