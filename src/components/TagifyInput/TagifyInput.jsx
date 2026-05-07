import { useEffect, useMemo, useState } from "react";
import Tag from "@/components/Tag/Tag";
import formInputStyles from "@/components/FormInputText/FormInputText.module.scss";
import styles from "./TagifyInput.module.scss";

function normalizeTagName(input) {
  if (typeof input !== "string") return "";
  return input
    .trim()
    // allow users to paste “#tag”
    .replace(/^#\s*/, "")
    // collapse internal whitespace for stable length/dup checking
    .replace(/\s+/g, " ");
}

export function parseTagString(value) {
  if (!value || typeof value !== "string") return [];

  // Accept common separators (commas/newlines/semicolons)
  return value
    .replace(/\r\n/g, "\n")
    .replace(/[;\n]+/g, ",")
    .split(",")
    .map(normalizeTagName)
    .filter(Boolean);
}

function joinTags(tags) {
  return tags.join(", ");
}

export default function TagifyInput({
  label,
  placeholder,
  value,
  onChange,
  isRequired,
  disabled,
  minTagLength = 2,
  maxTagLength = 40,
  maxTags = 10,
}) {
  const parsedFromValue = useMemo(() => parseTagString(value), [value]);
  const [tags, setTags] = useState(parsedFromValue);
  const [inputValue, setInputValue] = useState("");
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    setTags(parsedFromValue);
  }, [parsedFromValue]);

  function notifyChange(nextTags) {
    setTags(nextTags);
    onChange?.(joinTags(nextTags));
  }

  function addRawCandidates(raw) {
    const candidates = raw
      .split(/[;,]+/g)
      .map(normalizeTagName)
      .filter(Boolean);

    if (candidates.length === 0) return;

    if (tags.length >= maxTags) {
      setLocalError(`Max ${maxTags} tags allowed.`);
      return;
    }

    const nextTags = [...tags];

    for (const candidate of candidates) {
      if (nextTags.length >= maxTags) {
        setLocalError(`Max ${maxTags} tags allowed.`);
        break;
      }

      if (candidate.length < minTagLength) {
        setLocalError(`Tags must be at least ${minTagLength} characters.`);
        return;
      }
      if (candidate.length > maxTagLength) {
        setLocalError(`Tags must be ${maxTagLength} characters or less.`);
        return;
      }

      const alreadyExists = nextTags.some(
        (t) => t.toLowerCase() === candidate.toLowerCase()
      );
      if (alreadyExists) continue;

      nextTags.push(candidate);
    }

    setLocalError("");
    notifyChange(nextTags);
    setInputValue("");
  }

  function removeTag(idx) {
    const nextTags = tags.filter((_, i) => i !== idx);
    setLocalError("");
    notifyChange(nextTags);
  }

  function handleKeyDown(e) {
    if (disabled) return;

    if (e.key === "Enter") {
      e.preventDefault();
      if (!inputValue.trim()) return;
      addRawCandidates(inputValue);
    }
  }

  function handleBlur() {
    if (disabled) return;
    // Only Enter commits a tag; abandon draft text when focus leaves.
    setInputValue("");
    setLocalError("");
  }

  function handleInputChange(e) {
    if (disabled) return;
    setInputValue(e.target.value);
    if (localError) setLocalError("");
  }

  const canAddMore = tags.length < maxTags;

  return (
    <div className={formInputStyles.formGroup}>
      {label && (
        <label className={formInputStyles.inputLabel}>
          {label}
          {isRequired && (
            <span className={formInputStyles.required}>*</span>
          )}
        </label>
      )}

      <div className={styles.wrapper} aria-disabled={disabled ? "true" : "false"}>
        <div className={styles.row}>
          {tags.map((t, idx) => (
            <Tag
              key={`${t}-${idx}`}
              name={t}
              removable
              onRemove={() => removeTag(idx)}
            />
          ))}

          {canAddMore && (
            <div className={styles.inlineInputWrapper}>
              <span className={styles.inputHash}>#</span>
              <input
                className={styles.inlineInput}
                placeholder={placeholder}
                value={inputValue}
                disabled={disabled}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
                autoComplete="off"
                maxLength={maxTagLength}
              />
            </div>
          )}
        </div>

        {localError && (
          <span className={formInputStyles.errorMessage} role="alert">
            {localError}
          </span>
        )}
      </div>
    </div>
  );
}

