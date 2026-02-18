import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { formatDistance } from "date-fns";
import { authenticatedFetch } from "@/utils/authHelpers";
import { getStoredUser } from "@/utils/getStoredUser";
import { BASE_URL } from "@/constants/api";
import { createPost } from "@/api/post";
import { fetchAllEvents } from "@/api/event";
import Post from "@/components/Post/Post";
import PostSkeleton from "@/components/PostSkeleton/PostSkeleton";
import EmojiPickerButton from "@/components/EmojiPickerButton/EmojiPickerButton";
import Icon from "@/icons/Icon";
import styles from "./DashboardPage.module.scss";
// Add import at the top
import PrivacyModal from '@/components/PrivacyModal/PrivacyModal';


const POSTS_PER_PAGE = 10;
const MAX_POST_LEN = 250;

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [profileData, setProfileData] = useState(null);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [members, setMembers] = useState([]);

  // Inline create post state
  const [postText, setPostText] = useState("");
  const [postImages, setPostImages] = useState([]);
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

    async function loadEvents() {
      try {
        const events = await fetchAllEvents();
        const today = new Date().toISOString().split("T")[0];
        const upcoming = events
          .filter((e) => e.date >= today)
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .slice(0, 5);
        setUpcomingEvents(upcoming);
      } catch (err) {
        console.error("Error loading events:", err);
      }
    }

    async function loadMembers() {
      try {
        const res = await authenticatedFetch(`${BASE_URL}/user`);
        const data = await res.json();
        setMembers(data.data || []);
      } catch (err) {
        console.error("Error loading members:", err);
      }
    }

    fetchProfile();
    loadEvents();
    loadMembers();
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
            comments: p.comments || [],
            reactions: p.reactions || {},
            tags: p.tags || [],
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
      const data = await createPost({ content: postText, images: postImages });

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
        links: [],
        comments: data.post.comments || [],
        reactions: data.post.reactions || {},
      };

      setPosts((prevPosts) => [newPost, ...prevPosts]);

      setPostText("");
      setPostImages([]);
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
                comments={post.comments}
                reactions={post.reactions}
                userId={post.userId}
                currentUserId={profileData?.id}
                userImage={post.userImage}
                tags={post.tags}
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
          {upcomingEvents.length > 0 ? (
            <div className={styles.eventsList}>
              {upcomingEvents.map(event => {
                const date = new Date(event.date + "T00:00:00");
                const month = date.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
                const day = date.getDate();
                return (
                  <div
                    key={event.id}
                    className={styles.eventCard}
                    onClick={() => router.push("/EventsPage")}
                    role="button"
                    tabIndex={0}
                  >
                    <div className={styles.eventDate}>
                      <span className={styles.eventMonth}>{month}</span>
                      <span className={styles.eventDay}>{day}</span>
                    </div>
                    <div className={styles.eventInfo}>
                      <p className={styles.eventTitle}>{event.title}</p>
                      <span className={styles.eventTime}>{event.time}</span>
                    </div>
                    <div className={styles.eventArrow}>
                      <Icon name="chevronRight" size={20} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className={styles.emptyWidget}>No upcoming events</p>
          )}
          <button className={styles.viewAllBtn} onClick={() => router.push("/EventsPage")}>
            View All Events
          </button>
        </div>

        {/* Community Members Widget */}
        <div className={styles.widget}>
          <h2 className={styles.widgetTitle}>Community</h2>
          <p className={styles.memberCount}>
            <Icon name="members" size={16} />
            <strong>{members.length}</strong> members
          </p>
          {members.length > 0 && (
            <div className={styles.memberAvatars}>
              {members.slice(0, 6).map((member) => (
                <img
                  key={member.id}
                  src={member.profile_image || "/assets/ProfileImage.jpg"}
                  alt={member.full_name}
                  className={styles.memberAvatar}
                  title={member.full_name}
                  onClick={() => router.push(`/ProfilePage/${member.id}`)}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/assets/ProfileImage.jpg";
                  }}
                />
              ))}
              {members.length > 6 && (
                <span className={styles.memberMore}>+{members.length - 6}</span>
              )}
            </div>
          )}
          <button className={styles.viewAllBtn} onClick={() => router.push("/MembersPage")}>
            View All Members
          </button>
        </div>
      </aside>
    </div>
  );
}
