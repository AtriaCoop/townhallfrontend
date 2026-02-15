import styles from './Post.module.scss';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import CommentModal from '@/components/CommentModal/CommentModal'
import LikeModal from '@/components/LikeModal/LikeModal';
import Tag from '@/components/Tag/Tag';
import { getCookie } from '@/utils/authHelpers';
import InlineComments from '@/components/InlineComments/InlineComments';
import ReactionPicker from '../ReactionPicker/ReactionPicker';
import { updatePost } from '@/api/post';
import { authenticatedFetch } from '@/utils/authHelpers';
import Icon from '@/icons/Icon';
import { getReactionEmoji } from '@/constants/reactions';
import { BASE_URL } from '@/constants/api';

export default function Post({
  fullName,
  organization,
  date,
  content,
  postImage,
  links,
  comments,
  userId,
  currentUserId,
  userImage,
  tags,
  postId,
  setPosts,
  reactions = {},
}) {

  const optionsRef = useRef(null);
  const router = useRouter();

  const [showOptions, setShowOptions] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [editText, setEditText] = useState(content.join('\n'));
  const [editImage, setEditImage] = useState(null);
  const [showComments, setShowComments] = useState(false);
  const [reportResponse, setReportResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [tag, setTag] = useState("");
  const [editTags, setEditTags] = useState(tags);
  const MAX_TAGS = 5;

  const isMyOwnPost = userId === currentUserId;

  const handleTagAdd = () => {
    if (!tag.trim()) return;
    if (editTags.length >= MAX_TAGS) return;

    setEditTags((prev) => [...prev, tag]);
    setTag("");
  }

  const removeTag = (idx) => {
    setEditTags((prev) => prev.filter((_, i) => i !== idx));
  };

  // UPDATE POST
  async function handleUpdatePost() {
    try {
      const result = await updatePost(postId, { content: editText, image: editImage, tags: editTags });
      console.log("Post updated successfully:", result);

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? {
              ...post,
              content: [editText],
              tags: editTags,
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
      const response = await authenticatedFetch(`${BASE_URL}/post/${postId}/`, {
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

  const handleOptionsClick = () => {
    setShowOptions(prev => !prev);
  };

  const handleCommentClick = () => {
    setShowComments(prev => !prev);
  };

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

  // REPORT POST
  const handleReportPost = async () => {

    // User should not be able to report their own post
    if (userId === currentUserId) return

    const reportData = {
      post_id: postId
    }

    try {
      setIsLoading(true)
      const response = await authenticatedFetch(`${BASE_URL}/post/${postId}/report`, {
        method: 'POST',
        body: JSON.stringify(reportData),
        headers: {
          "Content-type": 'application/json'
        }
      })
      const result = await response.json()

      // Set either success or error message
      setReportResponse(result.message)

    } catch (err) {
      console.error(err)
      setReportResponse(err.message || "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  const handleReactionClick = () => {
    setShowReactionPicker(prev => !prev);
  }

  return (
    <div className={styles.post}>

      <div className={styles.postHeader}>
        <img
          src={userImage || '/assets/ProfileImage.jpg'}
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
        <div className={styles.moreOptions} onClick={handleOptionsClick}>
          ⋯
        </div>

        {/* Edit Post Modal */}
        {showOptions && (
          <div className={styles.optionsMenu} ref={optionsRef}>
            {isMyOwnPost ? (
              <>
                <button onClick={() => setShowEditModal(true)}>Edit</button>
                <button onClick={() => setShowDeleteModal(true)}>Delete</button>
              </>
            ) : (
              <button className={styles.reportText} disabled={userId === currentUserId} onClick={() => setShowReportModal(true)}>Report</button>
            )}
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

              {/* Tag Creation */}
              <div className={styles.createTags}>
                <div className={styles.tagList}>
                  {editTags.map((tag, index) => (
                    <Tag key={index} name={tag} onRemove={() => removeTag(index)} />
                  ))}
                </div>

                <input value={tag} onChange={(e) => setTag(e.target.value)} />
                <button onClick={handleTagAdd}>ADD</button>
                <div>
                  {editTags.length >= MAX_TAGS && (
                    <span className={styles.tagWarning}>Reached max limit of tags</span>
                  )}
                </div>
              </div>

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
        {/* Show Report Modal */}
        {showReportModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContentDelete}>
              <button className={styles.closeButton} onClick={() => { setReportResponse(''); setShowReportModal(false) }}>×</button>
              {isLoading && (
                <h1>Loading...</h1>
              )}
              {reportResponse ? (
                <>
                  <h1>{reportResponse}</h1>
                </>
              ) : (
                <>
                  <h1>Are you sure?</h1>
                  <button className={styles.deleteButton} onClick={handleReportPost}>Report</button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <div className={styles.postContent}>

        {/* Detected links and hyperlinks it */}
        {content.map((p, i) => (
          <p key={i}>
            {p.split(/(\s+)/).map((part, j) => {
              const isLink = /^https?:\/\/\S+$/.test(part);
              return isLink ? (
                <a key={j} href={part} target="_blank" rel="noopener noreferrer">
                  {part}
                </a>
              ) : (
                part
              );
            })}
          </p>
        ))}

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

      {Object.keys(reactions).length > 0 && (
        <div className={styles.reactionsDisplay}>
          {Object.entries(reactions).map(([reactionType, users]) => (
            users.length > 0 && (
              <div key={reactionType} className={styles.reactionGroup}>
                <span className={styles.reactionEmoji}>
                  {getReactionEmoji(reactionType)}
                </span>
                <span className={styles.reactionCount}>{users.length}</span>
                <div className={styles.reactionTooltip}>
                  {users.map(u => u.full_name || "Unknown").join(", ")}
                </div>
              </div>
            )
          ))}
        </div>
      )}

      <div className={styles.postFooter}>
        {/* Post Tags */}
        {tags?.length > 0 && (
          <div className={styles.postFooterTop}>
            {tags.map((tag, index) => (
              <Tag key={index} removable={false} name={tag} />
            ))}
          </div>
        )}

        <div className={styles.reactions}>
          <Icon name="message" className={`${styles.postIcon} ${showComments ? styles.active : ''}`} onClick={handleCommentClick} />
          <div className={styles.likesComments} onClick={handleCommentClick}>
            {comments?.length} Comment{comments?.length !== 1 ? 's' : ''}
          </div>
          {/* Reaction Picker Wrapper */}
          <div className={styles.reactionWrapper}>
            <button
              className={`${styles.reactionTrigger} ${showReactionPicker ? styles.active : ''}`}
              onClick={handleReactionClick}
              onMouseDown={(e) => e.stopPropagation()}
              title="Add reaction"
            >
              <Icon name="smile" size={20} />
            </button>
            {showReactionPicker && (
              <ReactionPicker
                currentReactions={reactions}
                currentUserId={currentUserId}
                postId={postId}
                BASE_URL={BASE_URL}
                setPosts={setPosts}
                onClose={() => setShowReactionPicker(false)}
              />
            )}
          </div>
        </div>
      </div>

      {/* Inline Comments Section */}
      <InlineComments
        comments={comments}
        currentUserId={currentUserId}
        postId={postId}
        BASE_URL={BASE_URL}
        setPosts={setPosts}
        isExpanded={showComments}
        onToggle={() => setShowComments(prev => !prev)}
      />
    </div>
  );
}