import styles from './ChatModal.module.scss';
import { useRef, useState, useEffect } from 'react';

export default function Modal({
  title,
  buttonText = "Submit",
  onClose,
  onUserSelect,
}) {

  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE || '';

  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);
  const [searchUsers, setSearchUsers] = useState('');

  const filteredUsers = users
  .filter((user) =>
  `${user.full_name}`.toLowerCase().includes(searchUsers.toLowerCase())
  )
  // users in alphabetical order
  .sort((a, b) => {
    const nameA = `${a.full_name}`.toLowerCase();
    const nameB = `${b.full_name}`.toLowerCase();
    return nameA.localeCompare(nameB);
  });

  useEffect(() => {
    async function fetchUsers() {
        try {
            const response = await fetch (`${BASE_URL}/user`);
            const data = await response.json();
            setUsers(data.data || []);
        } catch (error) {
            console.error("Error fetching user data", error);
        }
    }
    fetchUsers();
}, [BASE_URL]);

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
          placeholder="Search for a user"
          className={styles.textInput}
          value={searchUsers}
          onChange={(e) => setSearchUsers(e.target.value)}
        />

        {error && <p className={styles.errorMessage}>{error}</p>}
        
        <div className={styles.userList}>
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user, idx) => (
              <div key={idx} className={styles.userItem} onClick={() => onUserSelect(user)}>
              <img src={user.profile_image} alt={user.name} className={styles.userImage} />
              <div className={styles.userInfo}>
                <h3>{user.full_name}</h3>
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
