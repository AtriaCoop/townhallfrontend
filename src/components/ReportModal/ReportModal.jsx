import styles from './ReportModal.module.scss';
import { useState } from 'react';

export default function ReportModal({
    onClose,
    handleSubmit
 }) {
    const [text, setText] = useState('');
    const MAX_POST_LEN = 250;
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
