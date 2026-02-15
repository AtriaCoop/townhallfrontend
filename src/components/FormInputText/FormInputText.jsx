import styles from "./FormInputText.module.scss";

export default function FormInputText({
  name,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  isRequired,
  disabled,
}) {
  return (
    <div className={styles.formGroup}>
      {label && (
        <label htmlFor={name} className={styles.inputLabel}>
          {label}
          {isRequired && <span className={styles.required}>*</span>}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`${styles.inputField} ${error ? styles.inputError : ""}`}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? `${name}-error` : undefined}
      />
      {error && (
        <span id={`${name}-error`} className={styles.errorMessage} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
