import styles from './CommentModal.module.scss';
import { formatDistance, subDays } from 'date-fns';
import { getCookie } from '@/utils/authHelpers';
import { useState, useRef } from 'react';
import { fetchMentions } from '@/api/user';
import Image from 'next/image';
import DynamicAvatar from '../DynamicAvatar/DynamicAvatar';

export default function CommentModal({ onClose, comments = [], currentUserId, postId, BASE_URL, setPosts }) {

  const [input, setInput] = useState("")
  const [showMentionUI, setShowMentionUI] = useState(false)
  const [mentionQuery, setMentionQuery] = useState("")
  const [mentionResults, setMentionResults] = useState([])
  const divRef = useRef(null);
 
  const handleInput = (e) => {
    // Store the innerText from the editable div
    setInput(e.currentTarget.innerText);
    // Use '@' to Trigger Mention UI
    const text = e.currentTarget.innerText;
    const lastAt = text.lastIndexOf("@");
    // If not found lastAt would return -1
    if (lastAt === -1) {
      setShowMentionUI(false);
      setMentionQuery("");
      return;
    }
    // Grab the text after the '@'
    const query = text.slice(lastAt + 1);
    // Regex pattern to stop detecting Mention
    // Allows only one space (since we're parsing full name)
    // punctuation or new line will escape
    const regex = /^([A-Za-z]*)(?: [A-Za-z]*)?$/
    if (regex.test(query)) {
      setShowMentionUI(true);
      setMentionQuery(query);
      fetchMentions(query).then(setMentionResults);
    } else {
      setShowMentionUI(false);
      setMentionQuery("");
    }
  };

  // Parses the text and inserts a <span> for Mention so we can style it
  // Since we're working with a editable <div> rather than <textarea>, we can add HTML tags
  const handleMentionSelect = (user) => {
    if (!divRef.current) return;
    // Find where the caret is currently
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    // Get full div text and the position of the last "@"
    const fullText = divRef.current.innerText;
    const lastAtIndex = fullText.lastIndexOf("@");
    if (lastAtIndex === -1) return;
    // Text before @
    const beforeAt = fullText.slice(0, lastAtIndex);
    // Clear the div and rebuild content
    divRef.current.innerHTML = "";
    // Add text before @
    const beforeNode = document.createTextNode(beforeAt);
    divRef.current.appendChild(beforeNode);
    // Create mention span
    const mentionSpan = document.createElement("span");
    mentionSpan.textContent = `@${user.full_name}`;
    mentionSpan.contentEditable = "false";
    mentionSpan.className = styles.mentionChip;
    divRef.current.appendChild(mentionSpan);
    // Add a space after
    const spaceNode = document.createTextNode(" ");
    divRef.current.appendChild(spaceNode);
    // Move cursor after the space
    const range = document.createRange();
    range.setStartAfter(spaceNode);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
    divRef.current.focus();
    // Update plain text state 
    setInput(beforeAt + `@${user.full_name} `);
    // Hide mention UI
    setShowMentionUI(false);
    setMentionQuery("");
  };
  

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const response = await fetch(`${BASE_URL}/comment/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: currentUserId,
          post: postId,
          content: input,
          created_at: new Date().toISOString(),
        }),
      });

      const data = await response.json();
      console.log('data',data)
      if (!response.ok) throw new Error(data.message || "Comment failed");

      // Update comment list in parent post
      setPosts(prev =>
        prev.map(post =>
          post.id === postId
            ? { ...post, comments: [...post.comments, data.comment] }
            : post
        )
      );

      setInput("")
    } catch (err) {
      console.error("Failed to add comment:", err);
    } finally {
      setInput("")
      setMentionQuery("")
      // Clear the editable div
      if (divRef.current) {
        divRef.current.innerHTML = ""
      }
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
      
      // Step 2: Delete post comment
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

        {/* Use editable div so we can insert <span> to show Mentions tags and style them differently */}
          <form className={styles.form} onSubmit={handleSubmit}>
            <div
              ref={divRef}
              contentEditable
              className={styles.textInput}
              onInput={handleInput}
            />
            <div className={styles.modalButton}>
              <button type="submit" className={styles.postButton}>POST</button>
            </div>
          </form>
        
        {/* Show Mention UI */}
        { showMentionUI && mentionResults.length > 0 && (
          <div className={styles.mentionWrapper}>
            { mentionResults.map( user => (
              <div key={user.id} className={styles.mention} onClick={()=>handleMentionSelect(user)}>
                <DynamicAvatar fullName={user.full_name} profileImage={user.profile_image} />
                <p>{user.full_name}</p>
              </div>
            ) ) }
          </div>
        )}

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
