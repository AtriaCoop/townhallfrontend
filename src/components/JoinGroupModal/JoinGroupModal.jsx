import styles from './JoinGroupModal.module.scss';
import { useRef, useState } from 'react';

export default function Modal({
  title,
  buttonText = "Submit",
  onClose,

}) {
  const [text, setText] = useState('');
  const [error, setError] = useState('');


   const groups = [
  { name: "#ATRIA Questions and Support" },
  { name: "#City Food Budget - City Meeting" },
  { name: "#Living Wage Community Food Sector Analysis" },
  { name: "#WG: Climate-Resilient Local Food Systems" },
  { name: "#WG: Decolonization & Indigenous Food Sovereignty" },
  { name: "#WG: Food as a Human Right" },
  { name: "#WG: Food Justice as a Public Health Priority" },
  { name: "#WG: Sustainable Resourcing for Community Food Systems" },
];



    const handleSubmit = async () => {
      // Replace with chat-specific logic
      console.log('Starting chat with selected user');
      onClose();
    };

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
        {error && <p className={styles.errorMessage}>{error}</p>}
        <div className={styles.userList}>
          {groups.map((group, idx) => (
            <div key={idx} className={styles.userItem}>
              <div className={styles.userInfo}>
                <h3>{group.name}</h3>
              </div>
            </div>
          ))}
        </div>
        <div className={styles.modalButton}>
          <button className={styles.postButton} onClick={handleSubmit}>
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}