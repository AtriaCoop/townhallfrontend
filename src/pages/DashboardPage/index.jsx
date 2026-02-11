import { useEffect, useRef, useState } from "react";
import { formatDistance } from "date-fns";
import { authenticatedFetch } from "@/utils/authHelpers";
import { getStoredUser } from "@/utils/getStoredUser";
import { BASE_URL } from "@/constants/api";
import { createPost } from "@/api/post";
import Post from "@/components/Post/Post";
import PostSkeleton from "@/components/PostSkeleton/PostSkeleton";
import EmojiPickerButton from "@/components/EmojiPickerButton/EmojiPickerButton";
import Icon from "@/icons/Icon";
import styles from "./DashboardPage.module.scss";
// Add import at the top
import PrivacyModal from '@/components/PrivacyModal/PrivacyModal';


const POSTS_PER_PAGE = 10;
const MAX_POST_LEN = 250;

// Mock data for upcoming events - replace with API call
const UPCOMING_EVENTS = [
  { id: 1, title: "Corem ipsum dolor sit amet, consectetur adipiscing elit.", date: "JAN 24", time: "7:00 PM" },
  { id: 2, title: "Corem ipsum dolor sit amet, consectetur adipiscing elit.", date: "JAN 24", time: "7:00 PM" },
  { id: 3, title: "Corem ipsum dolor sit amet, consectetur adipiscing elit.", date: "JAN 24", time: "7:00 PM" },
];

// Mock data for activity - replace with API call
const RECENT_ACTIVITY = [
  { id: 1, user: "@jjjjjjjjjj", action: "and 3 others liked your post", avatar: "/assets/ProfileImage.jpg" },
  { id: 2, user: "@jjjjjjjjjj", action: "and 3 others liked your post", avatar: "/assets/ProfileImage.jpg" },
  { id: 3, user: "@jjjjjjjjjj", action: "and 3 others liked your post", avatar: "/assets/ProfileImage.jpg" },
];

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [profileData, setProfileData] = useState(null);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  // Inline create post state
  const [postText, setPostText] = useState("");
  const [postImages, setPostImages] = useState([]);
  const [postPinned, setPostPinned] = useState(false);
  const [postError, setPostError] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const postImageRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const user = getStoredUser();
        if (!user?.id) {
          localStorage.removeItem("user");
          window.location.href = "/";
          return;
        }

        const response = await authenticatedFetch(`${BASE_URL}/user/${user.id}/`);
        if (!response.ok) {
          localStorage.removeItem("user");
          window.location.href = "/";
          return;
        }

        const data = await response.json();
        setProfileData(data.user);
      } catch (error) {
        console.error("Error fetching profile data:", error);
        localStorage.removeItem("user");
        window.location.href = "/";
      }
    }

    fetchProfile();
  }, []);

  useEffect(() => {
    async function fetchPosts() {
      try {
        setLoading(true);
        const res = await authenticatedFetch(`${BASE_URL}/post/?limit=${POSTS_PER_PAGE}&page=${currentPage}`);
        if (!res.ok) {
          console.error("Failed to fetch posts:", res.status);
          setPosts([]);
          setLoading(false);
          return;
        }

        const data = await res.json();
        if (data.error || !data.posts || !Array.isArray(data.posts)) {
          setPosts([]);
          setLoading(false);
          return;
        }

        function userInLiked(list, curr_uid) {
          if (!list || !Array.isArray(list)) return false;
          return list.some(user => user && user.id === curr_uid);
        }

        const formattedPosts = data.posts
          .filter(p => p && p.id)
          .map(p => ({
            id: p.id,
            userId: p.user?.id || null,
            fullName: p.user?.full_name || "Unknown User",
            organization: p.user?.primary_organization || "",
            userImage: p.user?.profile_image || null,
            date: formatDistance(new Date(p.created_at), new Date(), { addSuffix: true }),
            created_at: p.created_at,
            content: [p.content],
            postImage: p.image || null,
            links: [],
            likes: p.likes || 0,
            liked_by: p.liked_by || [],
            isLiked: profileData ? userInLiked(p.liked_by, profileData.id) : false,
            comments: p.comments || [],
            reactions: p.reactions || {},
            pinned: p.pinned || false,
          }));

        setPosts(formattedPosts);
        setTotalPages(data.total_pages || 1);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch posts", err);
        setLoading(false);
      }
    }

    if (profileData) {
      fetchPosts();
    }
  }, [profileData, currentPage, refreshTrigger]);

  const handlePreviousPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const handleNextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    const validImages = files.filter(file => file.type.startsWith("image/"));
    if (validImages.length) {
      setPostImages(prev => [...prev, ...validImages]);
    }
    e.target.value = "";
  };

  const handleSubmitPost = async () => {
    if (!postText.trim()) {
      setPostError("Post content is required.");
      return;
    }
    if (postText.length > MAX_POST_LEN) {
      setPostError("Post content is over " + MAX_POST_LEN + " characters.");
      return;
    }

    setIsPosting(true);
    try {
      const data = await createPost({ content: postText, images: postImages, pinned: postPinned });

      const newPost = {
        id: data.post.id,
        userId: data.post.user.id,
        fullName: data.post.user.full_name,
        organization: data.post.user.primary_organization,
        userImage: data.post.user.profile_image,
        created_at: data.post.created_at,
        date: formatDistance(new Date(data.post.created_at), new Date(), { addSuffix: true }),
        content: [data.post.content],
        postImage: data.post.image,
        pinned: data.post.pinned || false,
        links: [],
        likes: data.post.likes || 0,
        liked_by: data.post.liked_by || [],
        isLiked: false,
        comments: data.post.comments || [],
        reactions: data.post.reactions || {},
      };

      setPosts((prevPosts) => {
        const updatedPosts = [newPost, ...prevPosts];
        return updatedPosts.sort((a, b) => {
          if (a.pinned !== b.pinned) return b.pinned - a.pinned;
          return new Date(b.created_at) - new Date(a.created_at);
        });
      });

      setPostText("");
      setPostImages([]);
      setPostPinned(false);
      setPostError("");
      setIsComposing(false);
    } catch (err) {
      console.error(err);
      setPostError("Failed to create post. Please try again.");
    } finally {
      setIsPosting(false);
    }
  };

  const handleTextareaFocus = () => {
    setIsComposing(true);
  };

  const handleCancelPost = () => {
    setPostText("");
    setPostImages([]);
    setPostPinned(false);
    setPostError("");
    setIsComposing(false);
  };

  return (
    <div className={styles.dashboard}>
      {/* Main Feed Section */}
      <div className={styles.feedSection}>
        {/* Inline Create Post Card */}
        <div className={styles.createPostCard}>
          <div className={styles.createPostTop}>
            <img
              src={profileData?.profile_image || '/assets/ProfileImage.jpg'}
              alt="Your avatar"
              className={styles.createPostAvatar}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/assets/ProfileImage.jpg';
              }}
            />
            <textarea
              ref={textareaRef}
              className={`${styles.createPostInput} ${postText.length > MAX_POST_LEN ? styles.createPostInputError : ""}`}
              placeholder="What's on your mind?"
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              onFocus={handleTextareaFocus}
              rows={isComposing ? 3 : 1}
            />
          </div>

          {/* Image Previews */}
          {postImages.length > 0 && (
            <div className={styles.imagePreviewRow}>
              {postImages.map((img, idx) => (
                <div key={idx} className={styles.imagePreviewContainer}>
                  <img
                    src={URL.createObjectURL(img)}
                    alt={`preview-${idx}`}
                    className={styles.previewImage}
                  />
                  <button
                    className={styles.removeImageButton}
                    onClick={() => setPostImages(prev => prev.filter((_, i) => i !== idx))}
                    aria-label="Remove image"
                  >
                    <Icon name="close" size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {postError && <p className={styles.postErrorMessage}>{postError}</p>}

          {/* Action Bar */}
          <div className={styles.createPostActions}>
            <div className={styles.createPostToolbar}>
              <EmojiPickerButton onSelect={(emoji) => setPostText(prev => prev + emoji)} placement="bottom" />
              <button
                className={styles.toolbarButton}
                onClick={() => postImageRef.current.click()}
                aria-label="Add image"
              >
                <Icon name="image" size={20} />
              </button>
              {profileData?.is_staff && (
                <button
                  className={`${styles.toolbarButton} ${postPinned ? styles.toolbarButtonActive : ""}`}
                  onClick={() => setPostPinned(!postPinned)}
                  aria-label={postPinned ? "Unpin post" : "Pin post"}
                >
                  <Icon name="pin" size={20} />
                </button>
              )}
              <input
                ref={postImageRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handleImageSelect}
              />
            </div>

            <div className={styles.createPostSubmit}>
              {(isComposing || postText.length > 0) && (
                <span className={postText.length > MAX_POST_LEN ? styles.charCountError : styles.charCount}>
                  {postText.length}/{MAX_POST_LEN}
                </span>
              )}
              {isComposing && (
                <button
                  className={styles.cancelBtn}
                  onClick={handleCancelPost}
                >
                  Cancel
                </button>
              )}
              <button
                className={styles.postBtn}
                onClick={handleSubmitPost}
                disabled={isPosting || !postText.trim()}
              >
                {isPosting ? "Posting..." : "Post"}
              </button>
            </div>
          </div>
        </div>

        {/* Posts Feed */}
        {loading ? (
          <PostSkeleton count={3} />
        ) : posts.length === 0 ? (
          <div className={styles.emptyFeed}>
            <Icon name="newsFeed" size={48} />
            <h3>No posts yet</h3>
            <p>Be the first to share something with the community!</p>
          </div>
        ) : (
          <div className={styles.postsList}>
            {posts.map(post => (
              <Post
                key={post.id}
                fullName={post.fullName}
                organization={post.organization}
                date={post.date}
                content={post.content}
                postImage={post.postImage}
                links={post.links}
                likes={post.likes}
                liked_by={post.liked_by}
                isLiked={post.isLiked}
                comments={post.comments}
                reactions={post.reactions}
                userId={post.userId}
                currentUserId={profileData?.id}
                userImage={post.userImage}
                pinned={post.pinned}
                is_staff={profileData?.is_staff}
                postId={post.id}
                setPosts={setPosts}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              className={styles.paginationBtn}
              disabled={currentPage === 1}
              onClick={handlePreviousPage}
            >
              <Icon name="arrowleft" size={16} />
              Previous
            </button>
            <span className={styles.pageInfo}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              className={styles.paginationBtn}
              disabled={currentPage === totalPages}
              onClick={handleNextPage}
            >
              Next
              <Icon name="chevronRight" size={16} />
            </button>
          </div>
        )}
         {/* Privacy Notice Footer */}
       <div className={styles.privacyFooter}>
          <button 
            className={styles.privacyLink} 
            onClick={() => setShowPrivacyModal(true)}
          >
            Privacy Notice
          </button>
        </div>
      </div>

      {/* Privacy Modal */}
      {showPrivacyModal && (
        <PrivacyModal onClose={() => setShowPrivacyModal(false)} />
      )}

      {/* Sidebar Section */}
      <aside className={styles.sidebar}>
        {/* Upcoming Events Widget */}
        <div className={styles.widget}>
          <h2 className={styles.widgetTitle}>Upcoming Events</h2>
          <div className={styles.eventsList}>
            {UPCOMING_EVENTS.map(event => (
              <div key={event.id} className={styles.eventCard}>
                <div className={styles.eventDate}>
                  <span className={styles.eventMonth}>{event.date.split(' ')[0]}</span>
                  <span className={styles.eventDay}>{event.date.split(' ')[1]}</span>
                </div>
                <div className={styles.eventInfo}>
                  <p className={styles.eventTitle}>{event.title}</p>
                  <span className={styles.eventTime}>{event.time}</span>
                </div>
                <button className={styles.eventArrow}>
                  <Icon name="chevronRight" size={20} />
                </button>
              </div>
            ))}
          </div>
          <button className={styles.viewAllBtn}>View All Events</button>
        </div>

        {/* Activity Overview Widget */}
        <div className={styles.widget}>
          <h2 className={styles.widgetTitle}>Activity Overview</h2>
          <div className={styles.activityList}>
            {RECENT_ACTIVITY.map(activity => (
              <div key={activity.id} className={styles.activityItem}>
                <img
                  src={activity.avatar}
                  alt=""
                  className={styles.activityAvatar}
                />
                <p className={styles.activityText}>
                  <strong>{activity.user}</strong> {activity.action}
                </p>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
