import styles from './CommentModal.module.scss';
import { formatDistance, subDays } from 'date-fns';

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
              <div>
                <strong>{comment.user?.first_name} {comment.user?.last_name}</strong> - {
                    comment.created_at ? formatDistance(new Date(comment.created_at), new Date(), { addSuffix: true })
                    : ''
                }
                <p>{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
}
