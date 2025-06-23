import { useState, useRef, useEffect } from "react";
import { FaRegSmile } from "react-icons/fa";
import EmojiPicker from "emoji-picker-react";
import styles from "./EmojiPickerButton.module.scss";

export default function EmojiPickerButton({ onSelect }) {
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setShowPicker(false);
      }
    };
    if (showPicker) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showPicker]);

  return (
    <div className={styles.emojiWrapper}>
      <button
        type="button"
        className={styles.iconButton}
        onClick={() => setShowPicker((prev) => !prev)}
      >
        <FaRegSmile />
      </button>

      {showPicker && (
        <div ref={pickerRef} className={styles.emojiPicker}>
          <EmojiPicker onEmojiClick={(e) => {
            onSelect(e.emoji);
            setShowPicker(false);
          }} />
        </div>
      )}
    </div>
  );
}
