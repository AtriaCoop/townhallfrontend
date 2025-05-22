import styles from './CommentModal.module.scss';
import { formatDistance, subDays } from 'date-fns';
import { getCookie } from '@/utils/authHelpers';

export default function CommentModal({ onClose, comments = [], currentUserId, postId, BASE_URL, setPosts }) {

  async function handleSubmit(e) {
    e.preventDefault();
    const content = e.target.comment.value;

    try {
      const response = await fetch(`${BASE_URL}/comment/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: currentUserId,
          post: postId,
          content: content,
          created_at: new Date().toISOString(),
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Comment failed");

      // Update comment list in parent post
      setPosts(prev =>
        prev.map(post =>
          post.id === postId
            ? { ...post, comments: [...post.comments, data.comment] }
            : post
        )
      );

      e.target.reset();
    } catch (err) {
      console.error("Failed to add comment:", err);
    }
  }

  async function handleDeleteComment(commentId) {
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
      
      // Step 2: Delete comment
      const response = await fetch(`${BASE_URL}/comment/${commentId}/`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken
        },
      });
  
      if (!response.ok) {
        throw new Error("Failed to delete comment");
      }
  
      // Remove comment from the state
      setPosts(prev =>
        prev.map(post =>
          post.id === postId
            ? {
                ...post,
                comments: post.comments.filter(c => c.id !== commentId),
              }
            : post
        )
      );
    } catch (err) {
      console.error("Failed to delete comment:", err);
    }
  }  

  return (
    <div className={styles.modalOverlay}>

      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={onClose}>×</button>
        <h1>Comments</h1>

        {/* Comment input */}
        <form className={styles.form} onSubmit={handleSubmit}>
          <textarea
            name="comment"
            type="text"
            placeholder="Enter Comment..."
            className={styles.textInput}
            required
          />
          <div className={styles.modalButton}>
            <button type="submit" className={styles.postButton}>POST</button>
          </div>
        </form>

        {/* Show existing comments */}
        <div className={styles.commentList}>
            
          {comments.map((comment, idx) => (
            <div className={styles.commentItem} key={idx}>
            <img
              src={`${BASE_URL}${comment.user?.profile_image || '/assets/ProfileImage.jpg'}`}
              alt="user"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/assets/ProfileImage.jpg';
              }}
            />

            <div className={styles.commentContentWrapper}>
              <div className={styles.commentHeader}>
                <div>
                  <strong>{comment.user?.full_name}</strong> – {
                    comment.created_at ? formatDistance(new Date(comment.created_at), new Date(), { addSuffix: true }) : ''
                  }
                  <p>{comment.content}</p>
                </div>

                {comment.user?.id === currentUserId && (
                  <button
                    className={styles.deleteButton}
                    onClick={() => handleDeleteComment(comment.id)}
                  >
                    Delete
                  </button>
                )}

              </div>
            </div>
          </div>          
          ))}
        </div>
      </div>
      
    </div>
  );
}
