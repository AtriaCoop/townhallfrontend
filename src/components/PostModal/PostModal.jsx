import styles from './PostModal.module.scss';
import { useRef, useState, useEffect } from 'react';
import { formatDistance } from 'date-fns';
import { FaImage } from 'react-icons/fa';
import { createPost } from '@/api/post';
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
  const [pinned, setPinned] = useState(false)
  const [image, setImage] = useState(null);
  const [error, setError] = useState('');
  const [images, setImages] = useState([]);
  const MAX_POST_LEN = 250;

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

    if (text.length > MAX_POST_LEN) {
      setError("Post content is over " + MAX_POST_LEN + " characters.");
      return;
    }

    try {
      const data = await createPost({content: text, images: images, pinned: pinned})

      const newPost = {
        id: data.post.id,
        userId: data.post.user.id,
        fullName: data.post.user.full_name,
        organization: data.post.user.primary_organization,
        userImage: data.post.user.profile_image,
        created_at: data.post.created_at,
        date: formatDistance(new Date(data.post.created_at), new Date(), { addSuffix: true }),
        content: [data.post.content],
        postImage: data.post.image,
        pinned: data.post.pinned,
        links: [],
      };

      setPosts((prevPosts) => {
        const updatedPosts = [newPost, ...prevPosts]

        return updatedPosts.sort((a, b) => {
          if (a.pinned !== b.pinned) return b.pinned - a.pinned;
          return new Date(b.created_at) - new Date(a.created_at);
        });
      });
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
          className={text.length > MAX_POST_LEN ? styles.textAreaError : styles.textArea}
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
          {profileData.is_staff ?
            <button className={styles.pin} onClick={() => setPinned(!pinned)}><img src={pinned ? "/assets/pinned.png" : "/assets/unpinned.png"}/></button>
            :
            null
          }
          <p className={text.length > MAX_POST_LEN ? styles.characterCountError: styles.characterCount}>{text.length}/{MAX_POST_LEN}</p>
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
