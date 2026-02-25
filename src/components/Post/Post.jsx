import styles from './Post.module.scss';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import CommentModal from '@/components/CommentModal/CommentModal'
import LikeModal from '@/components/LikeModal/LikeModal';
import TagCreationField from '@/components/TagCreationField/TagCreationField';
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
  const [tagErrorText, setTagErrorText] = useState("");

  const isMyOwnPost = userId === currentUserId;

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
          <div className={styles.modalOverlay} onClick={() => setShowEditModal(false)}>
            <div className={styles.editModal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.editModalHeader}>
                <h2 className={styles.editModalTitle}>Edit Post</h2>
                <button className={styles.editCloseButton} onClick={() => setShowEditModal(false)} aria-label="Close">
                  <Icon name="close" size={20} />
                </button>
              </div>

              <div className={styles.editModalBody}>
                <textarea
                  className={styles.editTextArea}
                  placeholder="What's on your mind?"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                />

                {/* Image preview */}
                {(editImage || isValidImage(postImage)) && (
                  <div className={styles.editImagePreview}>
                    <img
                      src={editImage ? URL.createObjectURL(editImage) : postImage}
                      alt="Preview"
                      className={styles.editPreviewImg}
                    />
                    <button
                      className={styles.editRemoveImage}
                      onClick={() => setEditImage(null)}
                      aria-label="Remove image"
                    >
                      <Icon name="close" size={14} />
                    </button>
                  </div>
                )}

                {/* Tags */}
                <TagCreationField
                  tag={tag}
                  setTag={setTag}
                  tags={editTags}
                  setTags={setEditTags}
                  tagErrorText={tagErrorText}
                  setTagErrorText={setTagErrorText}
                />
              </div>

              <div className={styles.editModalFooter}>
                <div className={styles.editActions}>
                  <button
                    className={styles.editIconButton}
                    onClick={() => document.getElementById(`editImg-${postId}`).click()}
                    aria-label="Add image"
                  >
                    <Icon name="image" size={20} />
                  </button>
                  <input
                    type="file"
                    accept="image/*"
                    id={`editImg-${postId}`}
                    hidden
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file && file.type.startsWith("image/")) {
                        setEditImage(file);
                      }
                    }}
                  />
                </div>

                <div className={styles.editSubmitRow}>
                  <button className={styles.updateButton} onClick={handleUpdatePost}>Update</button>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Show Delete Modal */}
        {showDeleteModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.confirmModal}>
              <div className={styles.confirmIcon} data-variant="danger">
                <span>!</span>
              </div>
              <h3 className={styles.confirmTitle}>Delete Post</h3>
              <p className={styles.confirmText}>Are you sure you want to delete this post? This action cannot be undone.</p>
              <div className={styles.confirmActions}>
                <button className={styles.cancelButton} onClick={() => setShowDeleteModal(false)}>Cancel</button>
                <button className={styles.deleteButton} onClick={handleDeletePost}>Delete</button>
              </div>
            </div>
          </div>
        )}
        {/* Show Report Modal */}
        {showReportModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.confirmModal}>
              {isLoading ? (
                <>
                  <div className={styles.confirmIcon} data-variant="warning">
                    <span>...</span>
                  </div>
                  <h3 className={styles.confirmTitle}>Reporting</h3>
                  <p className={styles.confirmText}>Please wait while we process your report.</p>
                </>
              ) : reportResponse ? (
                <>
                  <div className={styles.confirmIcon} data-variant="info">
                    <span>i</span>
                  </div>
                  <h3 className={styles.confirmTitle}>{reportResponse}</h3>
                  <div className={styles.confirmActions}>
                    <button className={styles.cancelButton} onClick={() => { setReportResponse(''); setShowReportModal(false); }}>Close</button>
                  </div>
                </>
              ) : (
                <>
                  <div className={styles.confirmIcon} data-variant="warning">
                    <span>!</span>
                  </div>
                  <h3 className={styles.confirmTitle}>Report Post</h3>
                  <p className={styles.confirmText}>Are you sure you want to report this post? Our team will review it.</p>
                  <div className={styles.confirmActions}>
                    <button className={styles.cancelButton} onClick={() => { setReportResponse(''); setShowReportModal(false); }}>Cancel</button>
                    <button className={styles.reportButton} onClick={handleReportPost}>Report</button>
                  </div>
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

      {/* Post Tags */}
      {tags?.length > 0 && (
        <div className={styles.postFooterTop}>
          {tags.map((tag, index) => (
            <Tag key={index} removable={false} name={tag} />
          ))}
        </div>
      )}

      <div className={styles.postFooter}>
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