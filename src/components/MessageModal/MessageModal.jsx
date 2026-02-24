import styles from './MessageModal.module.scss';

export default function MessageModal({ onDelete, onEdit, onClose }) {
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <button className={styles.actionButton} onClick={onEdit}>
          Edit
        </button>
        <button className={`${styles.actionButton} ${styles.deleteButton}`} onClick={onDelete}>
          Delete
        </button>
      </div>
    </div>
  );
}
