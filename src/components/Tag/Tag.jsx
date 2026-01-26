import styles from '@/components/Tag/Tag.module.scss';

export default function Tag({ name, onRemove = () => {}, removable = true }) {
  return (
    <div className={styles.tag}>
      <span className={styles.name}>{name}</span>

      
      {removable && (

        <button
          type="button"
          className={styles.remove}
          onClick={onRemove}
          aria-label={`Remove ${name}`}
        >
          ×
        </button>
    
      )}
    </div>
  );
}