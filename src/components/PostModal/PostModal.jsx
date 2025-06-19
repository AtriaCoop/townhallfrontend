import styles from './PostModal.module.scss';
import { useRef, useState, useEffect } from 'react';
import { formatDistance } from 'date-fns';
import { FaImage } from 'react-icons/fa';
import EmojiPickerButton from '@/components/EmojiPickerButton/EmojiPickerButton';

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
  const [images, setImages] = useState([]);

  const postImageRef = useRef(null);

const handleImageSelect = (e) => {
  const files = Array.from(e.target.files);
  const validImages = files.filter(file => file.type.startsWith("image/"));

  if (validImages.length) {
    setImages(prev => [...prev, ...validImages]);
  } else {
    alert("Please upload valid image files.");
  }
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

        <div className={styles.actionRow}>
          <EmojiPickerButton onSelect={(emoji) => setText(prev => prev + emoji)} />
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
