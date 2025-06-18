import styles from './PostModal.module.scss';
import { useRef, useState, useEffect } from 'react';
import EmojiPicker from 'emoji-picker-react';
import { formatDistance } from 'date-fns';
import { FaRegSmile, FaImage } from 'react-icons/fa';

export default function Modal({
  title,
  buttonText = "Post",
  onClose,
  profileData,
  BASE_URL,
  posts,
  setPosts,
}) {
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [error, setError] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [images, setImages] = useState([]);

  const postImageRef = useRef(null);
  const emojiRef = useRef(null);

const handleImageSelect = (e) => {
  const files = Array.from(e.target.files);
  const validImages = files.filter(file => file.type.startsWith("image/"));

  if (validImages.length) {
    setImages(prev => [...prev, ...validImages]);
  } else {
    alert("Please upload valid image files.");
  }
};

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target)) {
        setShowEmojiPicker(false);
      }
    };
  
    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }
  
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEmojiPicker]);

  const handleEmojiClick = (emojiData) => {
    setText(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const handleSubmit = async () => {
    if (!text.trim()) {
      setError("Post content is required.");
      return;
    }

    const formData = new FormData();
    formData.append("user_id", profileData.id);
    formData.append("content", text);
    images.forEach((img) => formData.append("image", img));

    try {
      const res = await fetch(`${BASE_URL}/post/`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      const newPost = {
        id: data.post.id,
        userId: data.post.user.id,
        fullName: data.post.user.full_name,
        organization: data.post.user.primary_organization,
        userImage: data.post.user.profile_image,
        date: formatDistance(new Date(data.post.created_at), new Date(), { addSuffix: true }),
        content: [data.post.content],
        postImage: data.post.image,
        links: [],
      };

      setPosts([newPost, ...posts]);
      setText('');
      setImage(null);
      setError('');
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalCard}>
        <button className={styles.closeButton} onClick={onClose}>×</button>
        <h2 className={styles.modalTitle}>{title}</h2>

        <textarea
          className={styles.textArea}
          placeholder="What's on your mind?"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        {images.length > 0 && (
          <div className={styles.imageGrid}>
            {images.map((img, idx) => (
              <div key={idx} className={styles.imagePreviewContainer}>
                <img
                  src={URL.createObjectURL(img)}
                  alt={`preview-${idx}`}
                  className={styles.previewImage}
                />
                <button
                  className={styles.removeImageButton}
                  onClick={() => {
                    setImages(prev => prev.filter((_, i) => i !== idx));
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {showEmojiPicker && (
          <div ref={emojiRef} className={styles.emojiPicker}>
            <EmojiPicker onEmojiClick={handleEmojiClick} />
          </div>
        )}

        <div className={styles.actionRow}>
          <button className={styles.iconButton} onClick={() => setShowEmojiPicker(prev => !prev)}>
            <FaRegSmile />
          </button>
          <button className={styles.iconButton} onClick={() => postImageRef.current.click()}>
            <FaImage />
          </button>
          <input
            ref={postImageRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handleImageSelect}
          />
          <div className={styles.flexSpacer} />
          <button className={styles.postButton} onClick={handleSubmit}>
            {buttonText}
          </button>
        </div>

        {error && <p className={styles.errorMessage}>{error}</p>}
      </div>
    </div>
  );
}
