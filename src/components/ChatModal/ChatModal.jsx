import styles from './ChatModal.module.scss';
import { useRef, useState } from 'react';

export default function Modal({
  title,
  buttonText = "Submit",
  onClose,

}) {
  const [text, setText] = useState('');
  const [error, setError] = useState('');


    const users = [
    {
      name: "John Smith",
      imageSrc: "/assets/members/aldo.png",
    },
    {
      name: "Sarah Johnson",
      imageSrc: "/assets/members/aldo.png",
    },
    {
      name: "Mike Wilson",
      imageSrc: "/assets/members/aldo.png",
    },
        {
      name: "John Smith",
      imageSrc: "/assets/members/aldo.png",
    },
    {
      name: "Sarah Johnson",
      imageSrc: "/assets/members/aldo.png",
    },
    {
      name: "Mike Wilson",
      imageSrc: "/assets/members/aldo.png",
    },
        {
      name: "John Smith",
      imageSrc: "/assets/members/aldo.png",
    },
    {
      name: "Sarah Johnson",
      imageSrc: "/assets/members/aldo.png",
    },
    {
      name: "Mike Wilson",
      imageSrc: "/assets/members/aldo.png",
    },
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

        <p className={styles.instructionText}>Choose someone to start a new conversation</p>
        <input
          type="text"
          placeholder="Search for a member"
          className={styles.textInput}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        {error && <p className={styles.errorMessage}>{error}</p>}
        <div className={styles.userList}>
          {users.map((user, idx) => (
            <div key={idx} className={styles.userItem}>
              <img src={user.imageSrc} alt={user.name} className={styles.userImage} />
              <div className={styles.userInfo}>
                <h3>{user.name}</h3>
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
