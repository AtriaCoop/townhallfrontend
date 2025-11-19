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
}) {
  return (
    <>
      <p className={styles.inputLabel}>
        {label} {isRequired && <span style={{ color: "red" }}>*</span>}
      </p>
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
