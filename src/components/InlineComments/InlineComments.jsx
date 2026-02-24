import { useState } from 'react';
import { useRouter } from 'next/router';
import { formatDistance } from 'date-fns';
import { authenticatedFetch } from '@/utils/authHelpers';
import MentionTextInput from '../MentionTextInput/MentionTextInput';
import Icon from '@/icons/Icon';
import styles from './InlineComments.module.scss';

const MAX_COMMENT_LEN = 250;
const INITIAL_COMMENTS_SHOWN = 3;

export default function InlineComments({
  comments = [],
  currentUserId,
  postId,
  BASE_URL,
  setPosts,
  isExpanded,
  onToggle,
}) {
  const router = useRouter();
  const [showAllComments, setShowAllComments] = useState(false);

  const displayedComments = showAllComments
    ? comments
    : comments.slice(-INITIAL_COMMENTS_SHOWN);

  const hiddenCount = comments.length - INITIAL_COMMENTS_SHOWN;

  async function handleSubmit(inputContent) {
    try {
      const response = await authenticatedFetch(`${BASE_URL}/comment/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post: postId,
          content: inputContent,
          created_at: new Date().toISOString(),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Comment failed');

      setPosts(prev =>
        prev.map(post =>
          post.id === postId
            ? { ...post, comments: [...post.comments, data.comment] }
            : post
        )
      );
    } catch (err) {
      console.error('Failed to add comment:', err);
    }
  }

  async function handleDeleteComment(commentId) {
    try {
      const response = await authenticatedFetch(`${BASE_URL}/comment/${commentId}/`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error('Failed to delete comment');

      setPosts(prev =>
        prev.map(post =>
          post.id === postId
            ? { ...post, comments: post.comments.filter(c => c.id !== commentId) }
            : post
        )
      );
    } catch (err) {
      console.error('Failed to delete comment:', err);
    }
  }

  const handleUserClick = (userId) => {
    router.push(`/ProfilePage/${userId}`);
  };

  if (!isExpanded) return null;

  return (
    <div className={styles.commentsSection}>
      {/* Comment Input */}
      <div className={styles.inputWrapper}>
        <MentionTextInput
          placeholder="Write a comment..."
          onSubmit={handleSubmit}
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

      {/* Comments List */}
      {comments.length > 0 && (
        <div className={styles.commentsList}>
          {/* Show more button */}
          {hiddenCount > 0 && !showAllComments && (
            <button
              className={styles.showMoreBtn}
              onClick={() => setShowAllComments(true)}
            >
              View {hiddenCount} more comment{hiddenCount !== 1 ? 's' : ''}
            </button>
          )}

          {displayedComments.map((comment) => (
            <div className={styles.comment} key={comment.id}>
              <img
                src={comment.user?.profile_image || '/assets/ProfileImage.jpg'}
                alt={comment.user?.full_name}
                className={styles.avatar}
                onClick={() => comment.user?.id && handleUserClick(comment.user.id)}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/assets/ProfileImage.jpg';
                }}
              />
              <div className={styles.commentContent}>
                <div className={styles.commentBubble}>
                  <span
                    className={styles.authorName}
                    onClick={() => comment.user?.id && handleUserClick(comment.user.id)}
                  >
                    {comment.user?.full_name}
                  </span>
                  <p className={styles.commentText}>{comment.content}</p>
                </div>
                <div className={styles.commentMeta}>
                  <span className={styles.timestamp}>
                    {comment.created_at
                      ? formatDistance(new Date(comment.created_at), new Date(), { addSuffix: true })
                      : ''}
                  </span>
                  {comment.user?.id === currentUserId && (
                    <button
                      className={styles.deleteBtn}
                      onClick={() => handleDeleteComment(comment.id)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Show less button */}
          {showAllComments && hiddenCount > 0 && (
            <button
              className={styles.showMoreBtn}
              onClick={() => setShowAllComments(false)}
            >
              Show less
            </button>
          )}
        </div>
      )}

      {/* Empty state */}
      {comments.length === 0 && (
        <p className={styles.emptyText}>No comments yet. Be the first to comment!</p>
      )}
    </div>
  );
}
