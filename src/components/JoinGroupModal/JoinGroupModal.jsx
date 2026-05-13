import styles from './JoinGroupModal.module.scss';
import { useState } from 'react';
import Icon from '@/icons/Icon';
import { formatGroupName } from '@/utils/formatGroupName';
import { authenticatedFetch } from '@/utils/authHelpers';
import { BASE_URL } from '@/constants/api';
import { useEffect } from 'react';

export default function JoinGroupModal({ title, onClose, onJoinGroup, onCreatingAGroup }) {
  const [searchText, setSearchText] = useState('');
  const [groups, setGroups] = useState([
    { id: -1, name: "atria-questions-and-support" },
    { id: -2, name: "city-food-budget-city-meeting" },
    { id: -3, name: "living-wage-community-food-sector-analysis" },
    { id: -4, name: "wg-climate-resilient-local-food-systems" },
    { id: -5, name: "wg-decolonization-and-indigenous-food-sovereignty" },
    { id: -6, name: "wg-food-as-a-human-right" },
    { id: -7, name: "wg-food-justice-as-a-public-health-priority" },
    { id: -8, name: "wg-sustainable-resourcing-for-community-food-systems" },
  ]);

  const filteredGroups = groups.filter(group =>
    formatGroupName(group.name).toLowerCase().includes(searchText.toLowerCase())
  );

  useEffect(() => {
    const fetchGroups = async () => {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = Number(userData.id);
      const res = await authenticatedFetch(
        `${BASE_URL}/chats/?user_id=${userId}`,
        { credentials: "include" }
      );
      const data = await res.json();
      const chatsFromServer = data?.data || [];

      const customGroups = chatsFromServer.flatMap((c) => (c.is_group ? [{ id: c.id, name: c.name }] : []));
      setGroups(prev => [...prev, ...customGroups]);
    }
    fetchGroups();
  }, [BASE_URL]);

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>{title}</h2>
           <button
            className={styles.createGroupButton}
            onClick={onCreatingAGroup}
            aria-label="create a group"
           >
            <Icon name="plus" size={20} />
            <p>Create a group</p>
          </button>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close">
            <Icon name="close" size={20} />
          </button>
        </div>

        <div className={styles.searchWrapper}>
          <Icon name="search" size={16} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search groups..."
            className={styles.searchInput}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>

        <div className={styles.groupList}>
          {filteredGroups.length > 0 ? (
            filteredGroups.map((group, idx) => (
              <div
                key={idx}
                className={styles.groupItem}
                onClick={() => onJoinGroup(group.name)}
              >
                <div className={styles.groupIcon}>
                  <Icon name="groupChats" size={18} />
                </div>
                <span className={styles.groupName}>{formatGroupName(group.name)}</span>
              </div>
            ))
          ) : (
            <p className={styles.noResults}>No groups found matching your search.</p>
          )}
        </div>
      </div>
    </div>
  );
}
