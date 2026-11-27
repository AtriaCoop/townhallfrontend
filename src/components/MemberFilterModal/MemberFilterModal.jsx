import { useEffect, useRef, useState } from 'react';
import styles from './MemberFilterModal.module.scss';
import { Filter } from 'lucide-react';


const MemberFilter = ({
    tags,
    selectedTags,
    onToggleTag,
    onClearFilters,
    tagCounts = {}
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const filterRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                filterRef.current &&
                !filterRef.current.contains(event.target)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener(
                'mousedown',
                handleClickOutside
            );
        };
    }, []);

    // Close dropdown with Escape
    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        };

        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, []);

    return (
        <div className={styles.filterContainer} ref={filterRef}>
            <button
                type="button"
                className={`${styles.filterButton} ${
                    isOpen ? styles.active : ''
                }`}
                onClick={() => setIsOpen(prev => !prev)}
                aria-expanded={isOpen}
                aria-haspopup="true"
            >
                <Filter size={22} strokeWidth={2} />
                <span>Filter</span>

                {selectedTags.length > 0 && (
                    <span className={styles.filterCount}>
                        {selectedTags.length}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className={styles.dropdown}>
                    <div className={styles.dropdownHeader}>
                        <h3>Filter by skill</h3>

                        <button
                            type="button"
                            className={styles.clearButton}
                            onClick={onClearFilters}
                            disabled={selectedTags.length === 0}
                        >
                            Clear filters
                        </button>
                    </div>

                    <div className={styles.tagList}>
                        {tags.map(tag => {
                            const isSelected =
                                selectedTags.includes(tag.id);

                            return (
                                <label
                                    key={tag.id}
                                    className={`${styles.tagOption} ${
                                        isSelected
                                            ? styles.selected
                                            : ''
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() =>
                                            onToggleTag(tag.id)
                                        }
                                    />

                                    <span className={styles.checkbox} />

                                    <span className={styles.tagName}>
                                        {tag.name}
                                    </span>

                                    <span className={styles.tagCount}>
                                        {tagCounts[tag.id] ?? 0}
                                    </span>
                                </label>
                            );
                        })}

                        {tags.length === 0 && (
                            <p className={styles.emptyMessage}>
                                No skills available.
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MemberFilter;