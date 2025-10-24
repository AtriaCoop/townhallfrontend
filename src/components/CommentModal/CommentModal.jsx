import styles from './CommentModal.module.scss';
import { formatDistance } from 'date-fns';
import { getCookie, authenticatedFetch } from '@/utils/authHelpers';
import MentionTextInput from '../MentionTextInput/MentionTextInput';
import { useState } from 'react';

export default function CommentModal({ onClose, comments = [], currentUserId, postId, BASE_URL, setPosts }) {
  const MAX_COMMENT_LEN = 250;



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

      // Update comment list in parent post
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
        headers: {
          "Content-Type": "application/json",
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


        <MentionTextInput 
          placeholder='Write a comment' onSubmit={onSubmit} inputClassName={styles.textInput} 
          formClassName={styles.form} buttonContainerClassName={styles.modalButton} buttonClassName={styles.postButton}
          mentionWrapperClassName={styles.mentionWrapper} mentionClassName={styles.mention} 
          mentionChipClassName={styles.mentionChip} maxLength={MAX_COMMENT_LEN}
        />


        {/* Show existing comments */}
        <div className={styles.commentList}>
            
          {comments.map((comment, idx) => (
            <div className={styles.commentItem} key={idx}>
            <img
              src={comment.user?.profile_image || '/assets/ProfileImage.jpg'}
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
