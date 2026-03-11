import { useState, useRef, useEffect } from "react";
import { SORT_OPTIONS } from "@/constants/sort";
import styles from "./SortBy.module.scss";

export default function SortBy({ onSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(SORT_OPTIONS[0]);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    setSelected(option);
    setIsOpen(false);
    onSelect(option.value);
  };

  return (
    <div className={styles.container} ref={containerRef}>
      <span className={styles.label}>Sort by</span>
      <div className={styles.dropdown}>
        <button
          className={styles.trigger}
          onClick={() => setIsOpen((prev) => !prev)}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span>{selected.label}</span>
          <svg
            className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>

        {isOpen && (
          <ul className={styles.menu} role="listbox">
            {SORT_OPTIONS.map((option) => (
              <li
                key={option.value}
                role="option"
                aria-selected={selected.value === option.value}
                className={`${styles.menuItem} ${
                  selected.value === option.value ? styles.menuItemActive : ""
                }`}
                onClick={() => handleSelect(option)}
              >
                {option.label}
                {selected.value === option.value && (
                  <svg
                    className={styles.checkIcon}
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
