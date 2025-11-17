import styles from "./FormInputText.module.scss";

export default function FormInputText({
  name,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
}) {
  return (
    <>
      <p className={styles.inputLabel}>{label}</p>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`${styles.inputField} ${error ? styles.inputError : ""}`}
      />
      {error && <span className={styles.errorMessage}>{error}</span>}
    </>
  );
}
