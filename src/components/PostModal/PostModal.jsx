import { useRef, useState } from 'react';
import { formatDistance } from 'date-fns';
import Icon from '@/icons/Icon';
import Tag from '@/components/Tag/Tag';
import { createPost } from '@/api/post';
import EmojiPickerButton from '@/components/EmojiPickerButton/EmojiPickerButton';
import styles from './PostModal.module.scss';

export default function Modal({
  title,
  buttonText = "Post",
  onClose,
  onPostCreated,
  profileData,
  BASE_URL,
  posts,
  setPosts,
}) {
  const [text, setText] = useState('');
  const [pinned, setPinned] = useState(false);
  const [image, setImage] = useState(null);
  const [error, setError] = useState('');
  const [images, setImages] = useState([]);
  const [tag, setTag] = useState("");
  const [tags, setTags] = useState([]);
  const [tagErrorText, setTagErrorText] = useState("");
  const MAX_POST_LEN = 250;
  const MAX_TAGS = 5;

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

  const handleTagAdd = () => {
    if (!tag.trim()) return;
    if (tags.length >= MAX_TAGS) {
      setTagErrorText("Can't add more than 5 tags.");
      return;
    };

    const exists = tags.some(
      (t) => t.toLowerCase() === tag.toLowerCase()
    );
    if (exists) {
      setTagErrorText("Can't add duplicate tag.");
      return;
    };

    setTags((prev) => [...prev, tag]);
    setTag("");
    setTagErrorText("");
  }

  const removeTag = (idx) => {
    setTags((prev) => prev.filter((_, i) => i !== idx));
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
      const data = await createPost({ content: text, images: images, pinned: pinned, tags: tags })

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
        pinned: data.post.pinned || false,
        tags: data.post.tags || [],
        links: [],
        likes: data.post.likes || 0,
        liked_by: data.post.liked_by || [],
        isLiked: false,
        comments: data.post.comments || [],
        reactions: data.post.reactions || {},
      };

      setPosts((prevPosts) => {
        const updatedPosts = [newPost, ...prevPosts];
        return updatedPosts.sort((a, b) => {
          if (a.pinned !== b.pinned) return b.pinned - a.pinned;
          return new Date(b.created_at) - new Date(a.created_at);
        });
      });

      setText('');
      setImage(null);
      setImages([]);
      setTags([]);
      setTag('');
      setError('');
      onClose();

      if (onPostCreated) {
        setTimeout(() => {
          onPostCreated();
        }, 500);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{title}</h2>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close">
            <Icon name="close" size={20} />
          </button>
        </div>

        <div className={styles.modalBody}>
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
                    aria-label="Remove image"
                  >
                    <Icon name="close" size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {error && <p className={styles.errorMessage}>{error}</p>}

          {/* Tag Creation */}
          <div className={styles.createTags}>
            <div className={styles.tagList}>
              {tags.map((tag, index) => (
                <Tag key={index} name={tag} onRemove={() => removeTag(index)} />
              ))}
            </div>

            <input value={tag} onChange={(e) => setTag(e.target.value)} />
            <button onClick={handleTagAdd}>ADD</button>
            <div>
              {tags.length >= MAX_TAGS && (
                <span className={styles.tagWarning}>Reached max limit of tags</span>
              )}
            </div>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <div className={styles.actionRow}>
            <EmojiPickerButton onSelect={(emoji) => setText(prev => prev + emoji)} />
            <button
              className={styles.iconButton}
              onClick={() => postImageRef.current.click()}
              aria-label="Add image"
            >
              <Icon name="image" size={20} />
            </button>
            {profileData?.is_staff && (
              <button
                className={`${styles.iconButton} ${pinned ? styles.pinned : ""}`}
                onClick={() => setPinned(!pinned)}
                aria-label={pinned ? "Unpin post" : "Pin post"}
              >
                <Icon name="pin" size={20} />
              </button>
            )}
            <input
              ref={postImageRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleImageSelect}
            />
          </div>

          <div className={styles.submitRow}>
            <span className={text.length > MAX_POST_LEN ? styles.characterCountError : styles.characterCount}>
              {text.length}/{MAX_POST_LEN}
            </span>
            <button className={styles.postButton} onClick={handleSubmit}>
              {buttonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
