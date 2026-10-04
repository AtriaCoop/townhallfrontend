import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Icon from '@/icons/Icon';
import { authenticatedFetch } from '@/utils/authHelpers';
import { BASE_URL } from '@/constants/api';
import styles from './ListMembersModal.module.scss';

export default function ListMembersModal({ onClose, memberIds }) {
  const router = useRouter();
  const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUD_ID;

  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const idsKey = Array.isArray(memberIds) ? memberIds.join(',') : '';

  useEffect(() => {
    if (!idsKey) {
      setUsers([]);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    const idsToFetch = idsKey.split(',');

    async function fetchMembers() {
      setIsLoading(true);
      try {
        const results = await Promise.all(
          idsToFetch.map(async (id) => {
            try {
              const response = await authenticatedFetch(`${BASE_URL}/user/${id}/`);
              const data = await response.json();
              return data.user;
            } catch (error) {
              console.error(`Error fetching user ${id}`, error);
              return null;
            }
          })
        );
        if (!cancelled) {
          setUsers(results.filter(Boolean));
        }
      } catch (error) {
        console.error('Error fetching member data', error);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchMembers();
    return () => {
      cancelled = true;
    };
  }, [idsKey]);

  const getProfileImage = (user) => {
    if (!user.profile_image) return '/assets/ProfileImage.jpg';
    if (user.profile_image.startsWith('http')) return user.profile_image;
    if (CLOUD_NAME) return `https://res.cloudinary.com/${CLOUD_NAME}/${user.profile_image}`;
    return '/assets/ProfileImage.jpg';
  };

  const handleUserClick = (user) => {
    onClose();
    router.push(`/ProfilePage/${user.id}`);
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Members</h2>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close">
            <Icon name="close" size={20} />
          </button>
        </div>

        <div className={styles.userList}>
          {isLoading ? (
            <p className={styles.noResults}>Loading members...</p>
          ) : users.length > 0 ? (
            users.map((user) => (
              <div
                key={user.id}
                className={styles.userItem}
                onClick={() => handleUserClick(user)}
              >
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
            <p className={styles.noResults}>No members to display.</p>
          )}
        </div>
      </div>
    </div>
  );
}
