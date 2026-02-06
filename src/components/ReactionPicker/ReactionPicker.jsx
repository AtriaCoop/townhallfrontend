import { useEffect, useRef } from 'react';
import styles from './ReactionPicker.module.scss';
import { authenticatedFetch } from '../../utils/authHelpers';
import { REACTIONS } from '@/constants/reactions';

export default function ReactionPicker({
  onReactionSelect,
  currentReactions = {},
  currentUserId,
  postId,
  BASE_URL,
  setPosts,
  onClose,
}) {
  const pickerRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        onClose?.();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  async function handleReactionClick(reactionType) {
    try {
      const url = `${BASE_URL}/post/${postId}/reaction/`;
      const response = await authenticatedFetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ reaction_type: reactionType })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || `Failed to toggle reaction (${response.status})`;
        throw new Error(errorMessage);
      }

      const result = await response.json();

      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId ? { ...post, reactions: result.reactions } : post
        )
      );

      if (onReactionSelect) {
        onReactionSelect(reactionType);
      }
    } catch (error) {
      console.error("Error toggling reaction:", error);
    }
  }

  return (
    <div className={styles.reactionPicker} ref={pickerRef}>
      {REACTIONS.map((reaction) => {
        const hasReacted = currentReactions[reaction.type]?.includes(currentUserId);

        return (
          <button
            key={reaction.type}
            className={`${styles.reactionButton} ${hasReacted ? styles.reacted : ''}`}
            onClick={() => handleReactionClick(reaction.type)}
            title={reaction.label}
          >
            <span className={styles.emoji}>{reaction.emoji}</span>
          </button>
        );
      })}
    </div>
  );
}
