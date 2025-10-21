import styles from './ReactionPicker.module.scss';

const REACTIONS = [
  { 
    type: 'love', 
    emoji: '❤️', 
    label: 'Love', 
    description: 'Stronger than Like, shows emotional connection.' 
  },
  { 
    type: 'appreciate', 
    emoji: '🤲', 
    label: 'Appreciate', 
    description: 'For thoughtful or inspiring content.' 
  },
  { 
    type: 'respect', 
    emoji: '👌', 
    label: 'Respect', 
    description: 'For achievements, efforts, or personal stories.' 
  },
  { 
    type: 'support', 
    emoji: '🤝', 
    label: 'Support', 
    description: 'To show solidarity or encouragement, especially during tough times.' 
  },
  { 
    type: 'inspired', 
    emoji: '☀️', 
    label: 'Inspired', 
    description: 'When content motivates or uplifts.' 
  },
  { 
    type: 'helpful', 
    emoji: '✅', 
    label: 'Helpful', 
    description: 'For posts that offer advice, tips, or useful info.' 
  }
];

export default function ReactionPicker({ 
  onReactionSelect, 
  currentReactions = {}, 
  currentUserId,
  postId,
  BASE_URL,
  setPosts 
}) {
  
  async function handleReactionClick(reactionType) {
    try {

      const csrfRes = await fetch(`${BASE_URL}/auth/csrf/`, {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      });

      const csrfData = await csrfRes.json();
      const csrfToken = csrfData.csrfToken;

      if (!csrfToken) {
        alert("Still initializing. Please try again in a moment.");
        return;
      }

      const response = await fetch(`${BASE_URL}/post/${postId}/reaction/`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
        body: JSON.stringify({
          reaction_type: reactionType,
          user_id: currentUserId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to toggle reaction");
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
    <div className={styles.reactionPicker}>
      {REACTIONS.map((reaction) => {
        const hasReacted = currentReactions[reaction.type]?.includes(currentUserId);
        const count = currentReactions[reaction.type]?.length || 0;
        
        return (
          <button
            key={reaction.type}
            className={`${styles.reactionButton} ${hasReacted ? styles.reacted : ''}`}
            onClick={() => handleReactionClick(reaction.type)}
            title={`${reaction.label}: ${reaction.description}`}
          >
            <span className={styles.emoji}>{reaction.emoji}</span>
            {count > 0 && (
              <span className={styles.count}>{count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
