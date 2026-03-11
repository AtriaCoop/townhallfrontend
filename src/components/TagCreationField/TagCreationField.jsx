import { useEffect, useRef, useState } from 'react';
import Tag from '@/components/Tag/Tag';
import { authenticatedFetch } from '@/utils/authHelpers';
import { BASE_URL } from '@/constants/api';
import styles from './TagCreationField.module.scss';

const MAX_TAGS = 5;
const MAX_TAG_LENGTH = 20;

export default function TagCreationField({
  tag,
  setTag,
  tags,
  setTags,
  tagErrorText,
  setTagErrorText,
}) {
  // Start expanded only if there are already-selected tags (e.g. edit mode)
  const [isExpanded, setIsExpanded] = useState(() => tags.length > 0);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const debounceRef = useRef(null);

  const handleExpand = () => {
    setIsExpanded(true);
    setShowCustomInput(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleCollapse = () => {
    setIsExpanded(false);
    setShowCustomInput(false);
    setTag('');
    setTagErrorText('');
    setAutocompleteSuggestions([]);
    setShowAutocomplete(false);
  };

  useEffect(() => {
    function handleClickOutside(e) {
      if (
        inputRef.current &&
        !inputRef.current.contains(e.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setShowAutocomplete(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => () => clearTimeout(debounceRef.current), []);

  const fetchAutocomplete = (prefix) => {
    clearTimeout(debounceRef.current);
    if (!prefix.trim()) {
      setAutocompleteSuggestions([]);
      setShowAutocomplete(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await authenticatedFetch(
          `${BASE_URL}/tags/given-prefix/?prefix=${encodeURIComponent(prefix)}`
        );
        if (!res.ok) return;
        const data = await res.json();
        const filtered = data
          .filter((s) => !tags.some((t) => t.toLowerCase() === s.name.toLowerCase()))
          .slice(0, 5);
        setAutocompleteSuggestions(filtered);
        setShowAutocomplete(filtered.length > 0);
        setActiveSuggestion(-1);
      } catch {
        setAutocompleteSuggestions([]);
      }
    }, 200);
  };

  const addTag = (name) => {
    const trimmed = name.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (!trimmed) return;
    if (trimmed.length < 2) {
      setTagErrorText('Tags must be at least 2 characters.');
      return;
    }
    if (tags.length >= MAX_TAGS) {
      setTagErrorText(`Max ${MAX_TAGS} tags allowed.`);
      return;
    }
    if (trimmed.length > MAX_TAG_LENGTH) {
      setTagErrorText(`Tags must be ${MAX_TAG_LENGTH} characters or less.`);
      return;
    }
    if (tags.some((t) => t.toLowerCase() === trimmed)) {
      setTagErrorText('Tag already added.');
      return;
    }
    setTags((prev) => [...prev, trimmed]);
    setTag('');
    setTagErrorText('');
    setAutocompleteSuggestions([]);
    setShowAutocomplete(false);
    setActiveSuggestion(-1);
  };

  const removeTag = (idx) => {
    setTags((prev) => prev.filter((_, i) => i !== idx));
  };

  const openCustomInput = () => {
    setShowCustomInput(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const closeCustomInput = () => {
    setShowCustomInput(false);
    setTag('');
    setTagErrorText('');
    setAutocompleteSuggestions([]);
    setShowAutocomplete(false);
    if (tags.length === 0) {
      setIsExpanded(false);
    }
  };

  const handleInputChange = (e) => {
    setTag(e.target.value);
    setTagErrorText('');
    fetchAutocomplete(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (showAutocomplete && autocompleteSuggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveSuggestion((prev) => Math.min(prev + 1, autocompleteSuggestions.length - 1));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveSuggestion((prev) => Math.max(prev - 1, -1));
        return;
      }
      if (e.key === 'Enter' && activeSuggestion >= 0) {
        e.preventDefault();
        addTag(autocompleteSuggestions[activeSuggestion].name);
        return;
      }
      if (e.key === 'Escape') {
        setShowAutocomplete(false);
        return;
      }
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(tag);
    }
  };

  // ── Collapsed state: tag section is opt-in ──────────────────────────
  if (!isExpanded && tags.length === 0) {
    return (
      <div className={styles.wrapper}>
        <button type="button" className={styles.addTagsTrigger} onClick={handleExpand}>
          <span className={styles.addTagsHash}>#</span>
          Add tags
        </button>
      </div>
    );
  }

  // ── Expanded state ───────────────────────────────────────────────────
  return (
    <div className={styles.wrapper}>
      <div className={styles.row}>
        {/* Selected tags */}
        {tags.map((t, i) => (
          <Tag key={i} name={t} removable onRemove={() => removeTag(i)} />
        ))}

        {tags.length < MAX_TAGS && (
          <>
            {/* Re-open input when it's been closed */}
            {!showCustomInput && (
              <button type="button" className={styles.addCustomBtn} onClick={openCustomInput}>
                + add
              </button>
            )}

            {/* Inline custom input */}
            {showCustomInput && (
              <div className={styles.inlineInputWrapper}>
                <span className={styles.inputHash}>#</span>
                <input
                  ref={inputRef}
                  className={styles.inlineInput}
                  placeholder="tag name…"
                  value={tag}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  autoComplete="off"
                  maxLength={MAX_TAG_LENGTH}
                />
                {tag.trim() && (
                  <button
                    type="button"
                    className={styles.confirmBtn}
                    onMouseDown={(e) => { e.preventDefault(); addTag(tag); }}
                  >
                    Add
                  </button>
                )}
                <button
                  type="button"
                  className={styles.closeInputBtn}
                  onClick={closeCustomInput}
                  aria-label="Close"
                >
                  ×
                </button>

                {showAutocomplete && autocompleteSuggestions.length > 0 && (
                  <ul className={styles.dropdown} ref={dropdownRef} role="listbox">
                    {autocompleteSuggestions.map((s, i) => (
                      <li
                        key={s.name}
                        className={`${styles.dropdownItem} ${i === activeSuggestion ? styles.dropdownItemActive : ''}`}
                        onMouseDown={(e) => { e.preventDefault(); addTag(s.name); }}
                        role="option"
                        aria-selected={i === activeSuggestion}
                      >
                        <span className={styles.dropdownHash}>#</span>
                        {s.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {tagErrorText && <span className={styles.error}>{tagErrorText}</span>}
    </div>
  );
}
