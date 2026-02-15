import styles from './ReportModal.module.scss';
import { useState } from 'react';
import { createReport } from '@/api/user'
import { formatDistance } from 'date-fns';

export default function ReportModal({
    onClose,
 }) {
    const [text, setText] = useState('');
    const MAX_POST_LEN = 250;
    const [error, setError] = useState('');
    const handleSubmit = async () => {
      if (!text.trim()) {
        setError("Content is empty");
        return;
      }
      if (text.length > MAX_POST_LEN) {
        setError("Post content is over " + MAX_POST_LEN + " characters.");
        return;
      }

      try {
        const data = await createReport({content: text})

      } catch (err) {
        console.log(err);
      }

      setText('');
      setError('');
      onClose();

    }

    return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalCard}>
        <button className={styles.closeButton} onClick={onClose}>×</button>
        <h2 className={styles.modalTitle}>Report a problem or request a feature</h2>

        <textarea
          className={text.length > MAX_POST_LEN ? styles.textAreaError : styles.textArea}
          placeholder="Enter input here"
          value={text}
          onChange={(e) => setText(e.target.value)}          
        />
        <p className={text.length > MAX_POST_LEN ? styles.characterCountError: styles.characterCount}>{text.length}/{MAX_POST_LEN}</p>
        <button className={styles.postButton} onClick={handleSubmit}>
            Submit
        </button>
    </div></div>
    );
}
