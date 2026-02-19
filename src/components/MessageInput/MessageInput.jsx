import styles from './MessageInput.module.scss';
import { useState, useRef } from 'react';
import EmojiPickerButton from '@/components/EmojiPickerButton/EmojiPickerButton';
import Icon from '@/icons/Icon';

export default function MessageInput({ onSend, placeholder = "Type your message..." }) {
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);

  const handleSend = () => {
    if (!inputText.trim() && !selectedImage) return;
    onSend(inputText, selectedImage);
    setInputText('');
    setSelectedImage(null);
  };

  return (
    <div className={styles.inputArea}>
      <EmojiPickerButton onSelect={(emoji) => setInputText(prev => prev + emoji)} />

      <button
        className={styles.iconButton}
        onClick={() => fileInputRef.current.click()}
        type="button"
        aria-label="Attach image"
      >
        <Icon name="image" size={20} />
      </button>

      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        hidden
        onChange={(e) => {
          const file = e.target.files[0];
          if (file) setSelectedImage(file);
        }}
      />

      {selectedImage && (
        <div className={styles.imagePreviewWrapper}>
          <img
            src={URL.createObjectURL(selectedImage)}
            alt="preview"
            className={styles.previewImage}
          />
          <button
            className={styles.removePreviewButton}
            onClick={() => setSelectedImage(null)}
            type="button"
            aria-label="Remove image"
          >
            ×
          </button>
        </div>
      )}

      <input
        type="text"
        placeholder={placeholder}
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
      />

      <button className={styles.sendButton} onClick={handleSend} aria-label="Send message">
        <Icon name="send" size={18} />
      </button>
    </div>
  );
}
