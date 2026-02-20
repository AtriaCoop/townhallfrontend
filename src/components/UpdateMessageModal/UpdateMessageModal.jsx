import { useState } from 'react';
import { authenticatedFetch } from '@/utils/authHelpers';
import { BASE_URL } from '@/constants/api';
import styles from './UpdateMessageModal.module.scss';

export default function UpdateMessageModal({ msg, onCancel, onUpdate, apiUrl }) {
  const id = msg.id;
  const [inputText, setInputText] = useState(msg.text || msg.message || "");

  const handleUpdate = async () => {
    if (!inputText.trim()) return;

    const formData = new FormData();
    formData.append("message_id", id);
    formData.append("content", inputText);

    const url = apiUrl || `${BASE_URL}/chats/messages/${id}/`;
    const res = await authenticatedFetch(url, {
      method: "PATCH",
      body: formData,
    });

    const data = await res.json();

    if (data.success) {
      if (onUpdate) onUpdate(id, inputText);
      onCancel();
    } else {
      console.error("Message update failed:", data.error);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onCancel}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.modalTitle}>Edit message</h3>
        <input
          className={styles.input}
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleUpdate()}
          autoFocus
        />
        <div className={styles.actions}>
          <button className={styles.cancelButton} onClick={onCancel}>
            Cancel
          </button>
          <button className={styles.saveButton} onClick={handleUpdate}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
