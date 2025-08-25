import styles from './MessageModal.module.scss';

export default function MessageModal({ onDelete, onEdit, onClose }) {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalCard}>
        <button className={styles.actionButtons} onClick={onEdit}>Edit</button>
        <button className={styles.actionButtons} onClick={onDelete}>Delete</button>
        <button className={styles.closeButton} onClick={onClose}>X</button>
      </div>
    </div>
  );
}