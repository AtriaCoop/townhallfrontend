import { useRouter } from 'next/router';
import { formatDistance } from 'date-fns';
import { authenticatedFetch } from '@/utils/authHelpers';
import MentionTextInput from '../MentionTextInput/MentionTextInput';
import Icon from '@/icons/Icon';
import styles from './CommentModal.module.scss';

export default function CommentModal({ onClose, comments = [], currentUserId, postId, BASE_URL, setPosts }) {
  const MAX_COMMENT_LEN = 250;
  const router = useRouter();

  async function onSubmit(inputContent) {
    try {
      const response = await authenticatedFetch(`${BASE_URL}/comment/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          post: postId,
          content: inputContent,
          created_at: new Date().toISOString(),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Comment failed");

      setPosts(prev =>
        prev.map(post =>
          post.id === postId
            ? { ...post, comments: [...post.comments, data.comment] }
            : post
        )
      );
    } catch (err) {
      console.error("Failed to add comment:", err);
    }
  }

  async function handleDeleteComment(commentId) {
    try {
      const response = await authenticatedFetch(`${BASE_URL}/comment/${commentId}/`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Failed to delete comment");
      }

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

  const handleUserClick = (userId) => {
    onClose();
    router.push(`/ProfilePage/${userId}`);
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Comments</h2>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close">
            <Icon name="close" size={20} />
          </button>
        </div>

        <div className={styles.inputSection}>
          <MentionTextInput
            placeholder="Write a comment..."
            onSubmit={onSubmit}
            inputClassName={styles.textInput}
            formClassName={styles.form}
            buttonContainerClassName={styles.buttonContainer}
            buttonClassName={styles.submitButton}
            mentionWrapperClassName={styles.mentionWrapper}
            mentionClassName={styles.mention}
            mentionChipClassName={styles.mentionChip}
            maxLength={MAX_COMMENT_LEN}
          />
        </div>

        <div className={styles.commentList}>
          {comments.length === 0 ? (
            <div className={styles.emptyState}>
              <Icon name="message" size={32} />
              <p>No comments yet</p>
            </div>
          ) : (
            comments.map((comment, idx) => (
              <div className={styles.commentItem} key={idx}>
                <img
                  src={comment.user?.profile_image || '/assets/ProfileImage.jpg'}
                  alt={comment.user?.full_name}
                  className={styles.commentAvatar}
                  onClick={() => comment.user?.id && handleUserClick(comment.user.id)}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/assets/ProfileImage.jpg';
                  }}
                />
                <div className={styles.commentBody}>
                  <div className={styles.commentHeader}>
                    <span
                      className={styles.commentAuthor}
                      onClick={() => comment.user?.id && handleUserClick(comment.user.id)}
                    >
                      {comment.user?.full_name}
                    </span>
                    <span className={styles.commentTime}>
                      {comment.created_at
                        ? formatDistance(new Date(comment.created_at), new Date(), { addSuffix: true })
                        : ''}
                    </span>
                  </div>
                  <p className={styles.commentText}>{comment.content}</p>
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
            ))
          )}
        </div>
      </div>
    </div>
  );
}
