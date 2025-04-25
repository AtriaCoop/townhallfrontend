import styles from './Post.module.scss';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';

export default function Post({ 
  userName,
  organization,
  date,
  content,
  links,
  likes,
  comments,
  userId,
  currentUserId,
  userImage
}) {

  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE;
  const optionsRef = useRef(null);
  const router = useRouter();

  const [showOptions, setShowOptions] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editText, setEditText] = useState(content.join('\n'));
  const [editImage, setEditImage] = useState(null);
  const [profileData, setProfileData] = useState(null)

  useEffect (() => {
    async function fetchProfile() {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user || !user.id) {
          console.error("No user found in localStorage.");
          return;
        }
        const response = await fetch (`${BASE_URL}/volunteer/${user.id}/`);
        const data = await response.json();
        setProfileData(data.volunteer);
      } catch(error) {
        console.error("Error fetching profile data:", error);
      }
    }
    fetchProfile();
  }, [])

  const handleOptionsClick = () => {
    setShowOptions(prev => !prev);
  };

  // Handle outside click to close edit/delete modal
  useEffect(() => {
    function handleClickOutside(e) {
      if (optionsRef.current && !optionsRef.current.contains(e.target)) {
        setShowOptions(false);
      }
    }
    if (showOptions) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showOptions]);

  return (
    <div className={styles.post}>
      <div className={styles.postHeader}>
        <img src={`${BASE_URL}${userImage}`}
          alt="User profile"
          className={styles.profilePic}
          onClick={() => router.push('/ProfilePage')}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/assets/ProfileImage.jpg'
          }}
        />
        <div className={styles.postInfo} onClick={() => router.push(`/ProfilePage/${userId}`)}>
          <div className={styles.userName}>{userName}</div>
          <div className={styles.organizationName}>{organization}</div>
          <div className={styles.date}>{date}</div>
        </div>
        {userId === currentUserId && (
          <div className={styles.moreOptions} onClick={handleOptionsClick}>
            ⋯
          </div>
        )}
        {/* Edit Post Modal */}
        {showOptions && (
          <div className={styles.optionsMenu} ref={optionsRef}>
            <button onClick={() => setShowEditModal(true)}>Edit</button>
            <button onClick={() => setShowDeleteModal(true)}>Delete</button>
          </div>
        )}
        {/* Show Edit Modal */}
        {showEditModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContentEdit}>
            <button className={styles.closeButton} onClick={() => setShowEditModal(false)}>×</button>
            <h1>Edit Post</h1>

            <p>Text</p>
            <input
              type="text"
              placeholder="Enter text..."
              className={styles.textInput}
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
            />

            <div className={styles.imageInput} onClick={() => document.getElementById(`editImg-${userId}`).click()}>
              Image
            </div>
            <input
              type="file"
              accept="image/*"
              id={`editImg-${userId}`}
              onChange={(e) => setEditImage(e.target.files[0])}
              style={{ display: 'none' }}
            />

            <div className={styles.modalButton}>
              <button className={styles.postButton} onClick={() => {
                // Placeholder for PATCH logic
                setShowEditModal(false);
              }}>
                Choose Photo
              </button>
              <button className={styles.updateButton} onClick={() => {
                // Placeholder for DELETE logic
                setShowEditModal(false);
              }}>
                Update
              </button>
            </div>
          </div>
        </div>
      )}
        {/* Show Delete Modal */}
        {showDeleteModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContentDelete}>
              <button className={styles.closeButton} onClick={() => setShowDeleteModal(false)}>×</button>
              <h1>Are you sure?</h1>
              <button className={styles.deleteButton}>Delete</button>
            </div>
          </div>
        )}
      </div>

      <div className={styles.postContent}>
        {content.map((p, i) => <p key={i}>{p}</p>)}
        {links.map((link, i) => (
          <a href={link.href} target="_blank" key={i}>{link.text}</a>
        ))}
      </div>

      <div className={styles.postFooter}>
        <div className={styles.reactions}>
          <img src="/assets/like.png" alt="like" />
          <img src="/assets/comment.png" alt="comment" />
        </div>
        <div className={styles.likesComments}>
          {likes} Likes · {comments} Comment{comments !== 1 && 's'}
        </div>
      </div>
    </div>
  );
}
