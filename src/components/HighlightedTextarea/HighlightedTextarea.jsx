import { forwardRef, useEffect, useRef } from "react";
import { linkifyText } from "@/utils/linkify";
import styles from "./HighlightedTextarea.module.scss";

const HighlightedTextarea = forwardRef(function HighlightedTextarea(
  { value, onChange, onFocus, onBlur, rows, placeholder, className = "", error = false },
  forwardedRef
) {
  const innerRef = useRef(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!forwardedRef) return;
    if (typeof forwardedRef === "function") {
      forwardedRef(innerRef.current);
    } else {
      forwardedRef.current = innerRef.current;
    }
  }, [forwardedRef]);

  useEffect(() => {
    const textarea = innerRef.current;
    const overlay = overlayRef.current;
    if (!textarea || !overlay || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(() => {
      overlay.style.height = `${textarea.offsetHeight}px`;
    });
    observer.observe(textarea);
    return () => observer.disconnect();
  }, []);

  const handleScroll = () => {
    if (overlayRef.current && innerRef.current) {
      overlayRef.current.scrollTop = innerRef.current.scrollTop;
      overlayRef.current.scrollLeft = innerRef.current.scrollLeft;
    }
  };

  const text = value || "";
  const segments = linkifyText(text);

  return (
    <div className={`${styles.wrapper} ${className}`}>
      <div className={styles.overlay} ref={overlayRef} aria-hidden="true">
        {segments.map((segment, i) =>
          segment.type === "link" ? (
            <span key={i}>
              {segment.leading}
              <span className={styles.link}>{segment.value}</span>
              {segment.trailing}
            </span>
          ) : (
            <span key={i}>{segment.value}</span>
          )
        )}
        {text.endsWith("\n") ? "​" : null}
      </div>
      <textarea
        ref={innerRef}
        className={`${styles.textarea} ${error ? styles.textareaError : ""}`}
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        onScroll={handleScroll}
        rows={rows}
        placeholder={placeholder}
      />
    </div>
  );
});

export default HighlightedTextarea;
