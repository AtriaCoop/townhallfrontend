import styles from './PostModal.module.scss';
import { useRef, useState } from 'react';
import { formatDistance, subDays } from 'date-fns';

export default function Modal({
  title,
  buttonText = "Submit",
  onClose,
  onSubmit,
  profileData,
  BASE_URL,
  posts,
  setPosts,
}) {
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [error, setError] = useState('')
  const postImageRef = useRef(null);

  const handlePostImageClick = () => postImageRef.current.click();

  const handlePostImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setImage(file);
    } else {
      alert("Please upload a valid image file.");
    }
  };

  const handleSubmit = async () => {
    if (!profileData) return;

    if (!text.trim()) {
      setError("Post content is required.");
      return;
    }

    const formData = new FormData();
    formData.append("volunteer_id", profileData.id);
    formData.append("content", text);
    if (image) {
      formData.append("image", image);
    }

    try {
      const response = await fetch(`${BASE_URL}/post/`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to create post");

      const data = await response.json();
      const newPost = {
        id: data.post.id,
        userId: data.post.volunteer.id,
        userName: `${data.post.volunteer.first_name} ${data.post.volunteer.last_name}`,
        organization: data.post.volunteer.primary_organization,
        userImage: data.post.volunteer.profile_image,
        date: formatDistance(new Date(data.post.created_at), new Date(), { addSuffix: true }),
        content: [data.post.content],
        links: [],
        likes: 0,
        comments: 0,
      };

      setPosts([newPost, ...posts]);
      setText('');
      setImage(null);
      setError('');
      onClose();
    } catch (error) {
      console.error("Error posting:", error);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={onClose}>×</button>
        <h1>{title}</h1>

        <p>Text</p>
        <input
          type="text"
          placeholder="Enter text..."
          className={styles.textInput}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        {error && <p className={styles.errorMessage}>{error}</p>}

        <p>Profile Picture</p>
        <div className={styles.imageInput} onClick={handlePostImageClick}>
          Choose Photo
        </div>
        <input
          type="file"
          accept="image/*"
          ref={postImageRef}
          onChange={handlePostImageChange}
          style={{ display: 'none' }}
        />

        <div className={styles.modalButton}>
          <button className={styles.postButton} onClick={handleSubmit}>
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}
