import { useEffect, useState } from "react";
import { formatDistance } from "date-fns";
import { authenticatedFetch } from "@/utils/authHelpers";
import { getStoredUser } from "@/utils/getStoredUser";
import { BASE_URL } from "@/constants/api";
import Post from "@/components/Post/Post";
import PostModal from "@/components/PostModal/PostModal";
import PostSkeleton from "@/components/PostSkeleton/PostSkeleton";
import Icon from "@/icons/Icon";
import styles from "./DashboardPage.module.scss";

const POSTS_PER_PAGE = 10;

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
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [profileData, setProfileData] = useState(null);

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
        const baseUrl = BASE_URL.endsWith("/") ? BASE_URL.slice(0, -1) : BASE_URL;
        const url = new URL(`${baseUrl}/post/`);
        url.searchParams.append("limit", POSTS_PER_PAGE.toString());
        url.searchParams.append("page", currentPage.toString());

        const res = await authenticatedFetch(url.toString());
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

  const handleCreatePost = () => setShowModal(true);
  const handlePreviousPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const handleNextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);

  return (
    <div className={styles.dashboard}>
      {/* Main Feed Section */}
      <div className={styles.feedSection}>
        {/* Create Post Card */}
        <div className={styles.createPostCard} onClick={handleCreatePost}>
          <img
            src={profileData?.profile_image || '/assets/ProfileImage.jpg'}
            alt="Your avatar"
            className={styles.createPostAvatar}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/assets/ProfileImage.jpg';
            }}
          />
          <span className={styles.createPostPlaceholder}>
            What is on your mind today?
          </span>
          <button className={styles.createPostBtn}>
            Create Post
          </button>
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
      </div>

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

      {/* Post Modal */}
      {showModal && (
        <PostModal
          title="New Post"
          buttonText="POST"
          onClose={() => setShowModal(false)}
          onPostCreated={() => {
            setCurrentPage(1);
            setRefreshTrigger(prev => prev + 1);
          }}
          profileData={profileData}
          BASE_URL={BASE_URL}
          posts={posts}
          setPosts={setPosts}
        />
      )}
    </div>
  );
}
