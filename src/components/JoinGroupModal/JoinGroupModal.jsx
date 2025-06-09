import styles from './JoinGroupModal.module.scss';
import { useRef, useState } from 'react';

export default function JoinGroupModal({ title, onClose, onJoinGroup }) {
  const [text, setText] = useState('');

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
    group.name.toLowerCase().includes(text.toLowerCase())
  );

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={onClose}>×</button>
        <h1>{title}</h1>

        <input
          type="text"
          placeholder="Search For A Group"
          className={styles.textInput}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <div className={styles.userList}>
          {filteredGroups.map((group, idx) => (
            <div
              key={idx}
              className={styles.userItem}
              onClick={() => onJoinGroup(group.name)}
            >
              <div className={styles.userInfo}>
                <h3>{group.name}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
