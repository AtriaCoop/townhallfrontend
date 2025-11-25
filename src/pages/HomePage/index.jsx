import Navigation from '@/components/Navigation/Navigation'
import styles from '@/pages/HomePage/HomePage.module.scss'
import Post from '@/components/Post/Post';
import PostModal from '@/components/PostModal/PostModal';
import Loader from '@/components/Loader/Loader';
import Clock from '@/components/Clock/Clock';
import { useEffect, useState } from 'react';
import { formatDistance } from 'date-fns';
import { authenticatedFetch } from '@/utils/authHelpers';

export default function HomePage({ hasNewDm }) {
    const BASE_URL = process.env.NEXT_PUBLIC_API_BASE || '';

    const POSTS_PER_PAGE = 10;
    const MAX_PAGINATION_BUTTONS = 5;
      
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
          const user = JSON.parse(localStorage.getItem("user"));
          if (!user || !user.id) {
            localStorage.removeItem("user"); // Clear any broken data
            window.location.href = "/";     // Redirect to landing/login page
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
          // Add query parameters for pagination
          const baseUrl = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
          const url = new URL(`${baseUrl}/post/`);
          url.searchParams.append('limit', POSTS_PER_PAGE.toString());
          url.searchParams.append('page', currentPage.toString());
          
          const res = await authenticatedFetch(url.toString());
          
          if (!res.ok) {
            console.error("Failed to fetch posts:", res.status, res.statusText);
            setPosts([]);
            setLoading(false);
            return;
          }
          
          const data = await res.json();
          console.log("Posts API response:", data); // Debug log

          // Check if response has an error
          if (data.error) {
            console.error("API error:", data.error);
            setPosts([]);
            setLoading(false);
            return;
          }

          // Check if data.posts exists and is an array
          if (!data.posts || !Array.isArray(data.posts)) {
            console.error("Invalid posts data:", data);
            setPosts([]);
            setLoading(false);
            return;
          }

          console.log("Number of posts received:", data.posts.length); // Debug log

          //Helper function to get user id from like_by list and compare it to current user
          function userInLiked(list, curr_uid){
            if (!list || !Array.isArray(list)) return false;
            for (const user of list){
              if(user && user.id === curr_uid){
                return true;
              }
            }
            return false;
          }

          const formattedPosts = data.posts
            .filter((p) => {
              // Only filter out completely invalid posts (no id or no content)
              if (!p || !p.id) {
                console.warn("Filtered out invalid post:", p);
                return false;
              }
              return true;
            })
            .map((p) => ({
              id: p.id,
              userId: p.user?.id || null,
              fullName: p.user?.full_name || 'Unknown User',
              organization: p.user?.primary_organization || '',
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
            }))
          
          console.log("Formatted posts count:", formattedPosts.length); // Debug log
          console.log("Sample formatted post:", formattedPosts[0]); // Debug log - check structure
          setPosts(formattedPosts);
          setTotalPages(data.total_pages || 1);
          setLoading(false);
          console.log("Loading set to false, posts should render now"); // Debug log
        } catch (err) {
          console.error("Failed to fetch posts", err);
          setLoading(false);
        }
      }
    
      if (profileData) {
        fetchPosts();
      }
    }, [profileData, currentPage, refreshTrigger]);

    // Debug: Log when posts state changes
    useEffect(() => {
      console.log("Posts state changed - length:", posts.length, "loading:", loading);
    }, [posts, loading]);      
  
    const handlePostClick = () => {
        setShowModal(true);
    }

    // Handle pagination previous page button
    const handlePreviousPage = () => {
      if (currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    }

    // Handle pagination next page button
    const handleNextPage = () => {
      if (currentPage < totalPages) {
        setCurrentPage(currentPage + 1);
      }
    }

    // Handle pagination index page buttons
    const handlePageChange = (page) => {
      setCurrentPage(page);
    }

    // Calculate which page buttons to display
    const getPageNumbers = () => {
      // Calculate dynamic thresholds based on MAX_PAGINATION_BUTTONS
      const halfButtons = Math.floor(MAX_PAGINATION_BUTTONS / 2);
      const startThreshold = halfButtons + 1; // When to start showing first N pages
      const endThreshold = totalPages - halfButtons; // When to show last N pages
      const centerOffset = Math.floor((MAX_PAGINATION_BUTTONS - 1) / 2); // Pages before/after current when centered
      
      // If total pages is less than or equal to max buttons, show all pages
      if (totalPages <= MAX_PAGINATION_BUTTONS) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
      }
      
      // If current page is near the start, show first N pages
      if (currentPage < startThreshold) {
        return Array.from({ length: MAX_PAGINATION_BUTTONS }, (_, i) => i + 1);
      }
      
      // If current page is near the end, show last N pages
      if (currentPage > endThreshold) {
        return Array.from({ length: MAX_PAGINATION_BUTTONS }, (_, i) => totalPages - MAX_PAGINATION_BUTTONS + i + 1);
      }
      
      // For pages in the middle, center the current page
      // Show equal pages before and after (when possible)
      const startPage = currentPage - centerOffset;
      return Array.from({ length: MAX_PAGINATION_BUTTONS }, (_, i) => startPage + i);
    };

    const pageNumbers = getPageNumbers();

    return (
        <div className={styles.container}>
            <Navigation hasNewDm={hasNewDm} />

            {/* HOME CONTENT CONTAINER */}
            <div className={styles.homeContainer}>
                <div className={styles.title}>
                  <div className={styles.headerSection}>
                    <h1 className={styles.header}>
                      News Feed
                    </h1>
                    <div className={styles.logoAndClockContainer}>
                      <img src="/assets/atriaLogo.png" alt="Atria" className={styles.atriaLogo} />
                      <Clock />
                    </div>
                  </div>
                    <p>
                        A place to share general information and updates with members
                        of the Vancouver Food Justice Coalition.
                    </p>
                </div>

                {/* Post component */}
                {loading ? (
                  <div className={styles.newsfeedLoader}><Loader/></div>
                ) : (
                  <>
                    {posts.length < 1 ? (
                      <div className={styles.emptyFeed}><i>Your feed is empty</i></div>
                    ) : (
                      posts.map((post) => {
                        console.log("Rendering Post component for post:", post.id, post.fullName);
                        return (
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
                        );
                      })
                    )}
                  </>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className={styles.pagination}>
                    <button disabled={currentPage === 1} onClick={handlePreviousPage}>PREV</button>
                    {pageNumbers.map((pageNum) => (
                      <button 
                          key={pageNum} 
                          onClick={() => handlePageChange(pageNum)}
                          className={currentPage === pageNum ? styles.activePage : ''}
                      >{pageNum}</button>
                    ))}
                    <button disabled={currentPage === totalPages} onClick={handleNextPage}>NEXT</button>
                  </div>
                )}

                {/* New Post Modal */}
                {showModal && (
                <PostModal
                    title="New Post"
                    buttonText="POST"
                    onClose={() => setShowModal(false)}
                    onPostCreated={() => {
                      setCurrentPage(1); // Reset to page 1 to show the new post
                      setRefreshTrigger(prev => prev + 1); // Force refetch
                    }}
                    profileData={profileData}
                    BASE_URL={BASE_URL}
                    posts={posts}
                    setPosts={setPosts}
                />
                )}
                {!showModal && (
                <div className={styles.newPostButton} onClick={handlePostClick}>
                   <img src={"/assets/pencilIcon.png"} alt="Pencil Icon" className={styles.pencilImage} /> NEW POST
                </div>
                )}
                
            </div>

        </div>
    );
}