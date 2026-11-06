import { useEffect, useRef } from 'react';
import styles from './ReactionPicker.module.scss';
import { authenticatedFetch } from '../../utils/authHelpers';
import { REACTIONS } from '@/constants/reactions';

export default function ReactionPicker({
  onReactionSelect,
  currentReactions = {},
  currentUserId,
  postId,
  messageId,
  BASE_URL,
  setPosts,
  setMessages,
  onClose,
  align = 'center',
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
      const url = messageId
        ? `${BASE_URL}/chats/messages/${messageId}/reaction/`
        : `${BASE_URL}/post/${postId}/reaction/`;
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

      if (setMessages && messageId) {
        setMessages((prevMessages) =>
          prevMessages.map((message) =>
            message.id === messageId
              ? { ...message, reactions: result.reactions }
              : message
          )
        );
      } else if (setPosts && postId) {
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId ? { ...post, reactions: result.reactions } : post
          )
        );
      }

      if (onReactionSelect) {
        onReactionSelect(reactionType);
      }
    } catch (error) {
      console.error("Error toggling reaction:", error);
    }
  }

  const alignClass =
    align === 'start'
      ? styles.alignStart
      : align === 'end'
        ? styles.alignEnd
        : '';

  return (
    <div className={`${styles.reactionPicker} ${alignClass}`} ref={pickerRef}>
      {REACTIONS.map((reaction) => {
        const hasReacted = currentReactions[reaction.type]?.some(u => u.id === currentUserId);

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
