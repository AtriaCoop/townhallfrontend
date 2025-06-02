import styles from './Post.module.scss';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import CommentModal from '@/components/CommentModal/CommentModal'
import LikeModal from '@/components/LikeModal/LikeModal';
import { getCookie } from '@/utils/authHelpers';

export default function Post({ 
  fullName,
  organization,
  date,
  content,
  postImage,
  links,
  likes,
  liked_by,
  comments,
  userId,
  currentUserId,
  userImage,
  postId,
  setPosts,
}) {

  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE || '';
  const optionsRef = useRef(null);
  const router = useRouter();

  const [showOptions, setShowOptions] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editText, setEditText] = useState(content.join('\n'));
  const [editImage, setEditImage] = useState(null);
  const [commentModal, setCommentModal] = useState(false);
  const [likeModal, setLikeModal] = useState(false);
  const [liked, setLiked] = useState(Array.isArray(liked_by) && liked_by.includes(currentUserId));

    // 🧠 GET CSRF COOKIE ON LOAD
    useEffect(() => {
      fetch(`${BASE_URL}/auth/csrf/`, {
        method: "GET",
        credentials: "include",
        mode: "cors",
        headers: {
          Accept: "application/json", // ✅ explicitly ask for JSON, not HTML
        },
      })
        .then(() => console.log("CSRF cookie set"))
        .catch(err => console.error("CSRF cookie failed", err));
    }, []);

  // UPDATE POST
  async function handleUpdatePost() {
    try {
      const formData = new FormData();
      formData.append("content", editText);
      if (editImage) {
        formData.append("image", editImage);
      }
  
      const response = await fetch(`${BASE_URL}/post/${postId}/`, {
        method: "PATCH",
        body: formData,
      });
  
      if (!response.ok) throw new Error("Failed to update post");
  
      const result = await response.json();
      console.log("Post updated successfully:", result);
  
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? {
                ...post,
                content: [editText],
                postImage: result.post?.image || post.postImage, // updated image
              }
            : post
        )
      );
  
      setShowEditModal(false);
    } catch (error) {
      console.error("Error updating post:", error);
    }
  }  
  
  // DELETE POST
  async function handleDeletePost() {
    try {
      const response = await fetch(`${BASE_URL}/post/${postId}/`, {
        method: "DELETE",
      });
  
      if (!response.ok) {
        throw new Error("Failed to delete post");
      }
  
      // Update local posts state to remove the deleted post
      setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
  
      // Close the delete modal
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  }

  // LIKE POST
async function handleLikePost() {
  try {
    // Step 1: Fetch CSRF from server
    const csrfRes = await fetch(`${BASE_URL}/auth/csrf/`, {
      method: "GET",
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
    });

    const csrfData = await csrfRes.json();
    const csrfToken = csrfData.csrfToken || getCookie("csrftoken");

    console.log("CSRF for like:", csrfToken);

    if (!csrfToken) {
      alert("Still initializing. Please try again in a moment.");
      return;
    }

    // Step 2: Like post
    const response = await fetch(`${BASE_URL}/post/${postId}/like/`, {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken,
      },
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Failed to like post: ${errText}`);
    }

    const result = await response.json();
    setLiked(prev => !prev);
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId ? { ...post, likes: result.likes } : post
      )
    );
  } catch (error) {
    console.error("Error liking post:", error);
  }
}

  const handleOptionsClick = () => {
    setShowOptions(prev => !prev);
  };

  const handleCommentClick = () => {
    console.log("Comment clicked!")
    setCommentModal(true);
  }

  const handleLikeClick = () => {
    console.log("Likes clicked!")
    setLikeModal(true);
  }

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

  function isValidImage(img) {
    return img && img !== 'null' && img !== '';
  }

  return (
    <div className={styles.post}>

      <div className={styles.postHeader}>
        {console.log({userImage})}
        <img src={userImage}
          alt="User profile"
          className={styles.profilePic}
          onClick={() => router.push(`/ProfilePage/${userId}`)}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/assets/ProfileImage.jpg'
          }}
        />
        <div className={styles.postInfo} onClick={() => router.push(`/ProfilePage/${userId}`)}>
          <div className={styles.fullName}>{fullName}</div>
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
            <textarea
              placeholder="Enter text..."
              className={styles.textInput}
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
            />

            <div
              className={styles.imageInput}
              onClick={() => document.getElementById(`editImg-${postId}`).click()}
            >
              {editImage ? (
                <img
                  src={URL.createObjectURL(editImage)}
                  alt="Preview"
                  className={styles.previewImage}
                />
              ) : isValidImage(postImage) ? (
                <img
                  src={postImage}
                  alt="Current Post Image"
                  className={styles.previewImage}
                />
              ) : (
                <span>Choose Photo</span>
              )}
            </div>

            <input
              type="file"
              accept="image/*"
              id={`editImg-${postId}`}
              style={{ display: "none" }}
              onChange={(e) => {
                const file = e.target.files[0];
                if (file && file.type.startsWith("image/")) {
                  setEditImage(file);
                }
              }}
            />

            <div className={styles.modalButton}>
              <button className={styles.postButton} onClick={() => {
                setShowEditModal(false);
              }}>
                Choose Photo
              </button>
              <button className={styles.updateButton} onClick={handleUpdatePost}>
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
              <button className={styles.deleteButton} onClick={handleDeletePost}>Delete</button>
            </div>
          </div>
        )}
      </div>

      <div className={styles.postContent}>
        {content.map((p, i) => <p key={i}>{p}</p>)}
        {links.map((link, i) => (
          <a href={link.href} target="_blank" key={i}>{link.text}</a>
        ))}
        {isValidImage(postImage) && (
          <img
            src={postImage}
            alt="Post content"
            className={styles.postImage}
          />
        )}
      </div>

      {commentModal && (
        <CommentModal
          onClose={() => setCommentModal(false)}
          comments={[...comments].reverse()}
          currentUserId={currentUserId}
          date={date}
          postId={postId}
          BASE_URL={BASE_URL}
          setPosts={setPosts}
        />
      )}

      {likeModal && (
        <LikeModal
          onClose={() => setLikeModal(false)}
          liked_by={liked_by}
          BASE_URL={BASE_URL}
        />
      )}

      <div className={styles.postFooter}>
        <div className={styles.reactions}>
          <img src={liked ? "/assets/liked.png" : "/assets/like.png"} alt="like" onClick={handleLikePost}/>
          <div className={styles.likesComments} onClick={handleLikeClick}>{likes} Likes</div>
          <img src="/assets/comment.png" alt="comment" onClick={handleCommentClick}/>
          <div className={styles.likesComments} onClick={handleCommentClick}>{comments?.length} Comment{comments?.length !== 1 ? 's' : ''}</div>
        </div>
      </div>

    </div>
  );
}
