import styles from "./MessageModal.module.scss";
import { useTranslation } from "@/hooks/useTranslation";

export default function MessageModal({ onDelete, onEdit, onClose }) {
  const { t } = useTranslation();
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <button className={styles.actionButton} onClick={onEdit}>
          {t("common.edit")}
        </button>
        <button
          className={`${styles.actionButton} ${styles.deleteButton}`}
          onClick={onDelete}
        >
          {t("common.delete")}
        </button>
      </div>
    </div>
  );
}
