import styles from '@/components/Tag/Tag.module.scss';

export default function Tag({ name, onRemove = () => {}, removable = true, onClick, active = false }) {
  const isClickable = typeof onClick === 'function';

  return (
    <div
      className={`${styles.tag} ${active ? styles.active : ''} ${isClickable ? styles.clickable : ''}`}
      onClick={isClickable ? onClick : undefined}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={isClickable ? (e) => e.key === 'Enter' && onClick(e) : undefined}
    >
      <span className={styles.hash}>#</span>
      <span className={styles.name}>{name}</span>
      {removable && (
        <button
          type="button"
          className={styles.remove}
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          aria-label={`Remove ${name}`}
        >
          ×
        </button>
      )}
    </div>
  );
}
