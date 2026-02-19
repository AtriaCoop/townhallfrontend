import styles from './JoinGroupModal.module.scss';
import { useState } from 'react';
import Icon from '@/icons/Icon';
import { formatGroupName } from '@/utils/formatGroupName';

export default function JoinGroupModal({ title, onClose, onJoinGroup }) {
  const [searchText, setSearchText] = useState('');

  const groups = [
    { name: "atria-questions-and-support" },
    { name: "city-food-budget-city-meeting" },
    { name: "living-wage-community-food-sector-analysis" },
    { name: "wg-climate-resilient-local-food-systems" },
    { name: "wg-decolonization-and-indigenous-food-sovereignty" },
    { name: "wg-food-as-a-human-right" },
    { name: "wg-food-justice-as-a-public-health-priority" },
    { name: "wg-sustainable-resourcing-for-community-food-systems" },
  ];

  const filteredGroups = groups.filter(group =>
    formatGroupName(group.name).toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>{title}</h2>
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
