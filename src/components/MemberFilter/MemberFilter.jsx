
import { useEffect, useRef, useState } from 'react';
import styles from './MemberFilter.module.scss';

const MemberFilter = ({
    tags = [],
    selectedTags = [],
    onSelectionChange
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');

    const filterRef = useRef(null);

    // Close dropdown when clicking outside.
    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (
                filterRef.current &&
                !filterRef.current.contains(event.target)
            ) {
                setIsOpen(false);
            }
        };

        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
            document.removeEventListener('keydown', handleEscape);
        };
    }, []);

    const toggleTag = (tagId) => {
        const isSelected = selectedTags.includes(tagId);

        const updatedTags = isSelected
            ? selectedTags.filter(id => id !== tagId)
            : [...selectedTags, tagId];

        onSelectionChange(updatedTags);
    };

    const clearFilters = () => {
        onSelectionChange([]);
    };

    const filteredTags = tags.filter(tag =>
        tag.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className={styles.member-filter} ref={filterRef}>
            <button
                className={styles.member-filter-button `${isOpen ? 'active' : ''}`}
                onClick={() => setIsOpen(prev => !prev)}
                aria-expanded={isOpen}
                aria-haspopup="true"
            >
                <i className="fas fa-sliders-h" />
                <span>Filter</span>

                {selectedTags.length > 0 && (
                    <span className={styles.member-filter-count}>
                        {selectedTags.length}
                    </span>
                )}

                <i className={`fas fa-chevron-down filter-chevron ${
                    isOpen ? 'rotated' : ''
                }`} />
            </button>

            {isOpen && (
                <div className={styles.member-filter-dropdown}>
                    <div className={styles.member-filter-header}>
                        <span>Filter by tags</span>
                        <span className={styles.filter-selected-count}>
                            {selectedTags.length} selected
                        </span>
                    </div>

                    <div className={styles.member-filter-search}>
                        <i className="fas fa-search" />
                        <input
                            type="text"
                            placeholder="Search tags..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>

                    <div className={styles.member-filter-options}>
                        {filteredTags.length > 0 ? (
                            filteredTags.map(tag => (
                                <label
                                    key={tag.id}
                                    className={styles.member-filter-option}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedTags.includes(tag.id)}
                                        onChange={() => toggleTag(tag.id)}
                                    />
                                    <span>{tag.name}</span>
                                </label>
                            ))
                        ) : (
                            <div className={styles.member-filter-empty}>
                                No tags found.
                            </div>
                        )}
                    </div>

                    <div className={styles.member-filter-footer}>
                        <span>
                            {selectedTags.length} tags selected
                        </span>

                        <button
                            onClick={clearFilters}
                            disabled={selectedTags.length === 0}
                        >
                            Clear filters
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MemberFilter;
