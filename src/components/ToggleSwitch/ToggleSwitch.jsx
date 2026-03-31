"use client";

import styles from "./ToggleSwitch.module.scss";

export default function ToggleSwitch({
  checked = false,
  onChange,
  disabled = false,
  label,
  "aria-label": ariaLabel,
  className = "",
}) {
  const labelId = label ? "toggle-label" : undefined;

  return (
    <label
      id={labelId}
      className={`${styles.root} ${disabled ? styles.disabled : ""} ${className}`}
    >
      <span
        role="switch"
        tabIndex={disabled ? -1 : 0}
        aria-checked={checked}
        aria-label={ariaLabel}
        aria-labelledby={label ? labelId : undefined}
        onClick={() => !disabled && onChange?.(!checked)}
        className={`${styles.track} ${checked ? styles.checked : ""} ${disabled ? styles.disabled : ""}`}
      >
        <span className={`${styles.thumb} ${checked ? styles.checked : ""}`} />
      </span>
      {label && <span className={styles.label}>{label}</span>}
    </label>
  );
}
