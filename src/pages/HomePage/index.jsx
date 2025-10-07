import Navigation from '@/components/Navigation/Navigation'
import styles from '@/pages/HomePage/HomePage.module.scss'
import Post from '@/components/Post/Post';
import PostModal from '@/components/PostModal/PostModal';
import Loader from '@/components/Loader/Loader';
import { useEffect, useRef, useState } from 'react';
import { formatDistance } from 'date-fns';

export default function HomePage({ hasNewDm }) {
    const BASE_URL = process.env.NEXT_PUBLIC_API_BASE || '';

    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [posts, setPosts] = useState([]);
    const [profileData, setProfileData] = useState(null)

    useEffect(() => {
      async function fetchProfile() {
        try {
          const user = JSON.parse(localStorage.getItem("user"));
          if (!user || !user.id) {
            localStorage.removeItem("user"); // Clear any broken data
            window.location.href = "/";     // Redirect to landing/login page
            return;
          }
    
          const response = await fetch(`${BASE_URL}/user/${user.id}/`);
    
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
            const res = await fetch(`${BASE_URL}/post/`);
            const data = await res.json();

            //Helper funciton to get user id from like_by list and compare it to current user
            function userInLiked(list, curr_uid){
              for (const user of list){
                if(user.id == curr_uid){
                  return true;
                }
              }
              return false;
            }

            const formattedPosts = data.posts.map((p) => ({
              id: p.id,
              userId: p.user.id,
              fullName: `${p.user.full_name}`,
              organization: p.user.primary_organization,
              userImage: p.user.profile_image,
              date: formatDistance(new Date(p.created_at), new Date(), { addSuffix: true }),
              content: [p.content],
              postImage: p.image,
              links: [],
              likes: p.likes,
              liked_by: p.liked_by,
              isLiked: userInLiked(p.liked_by,profileData.id),
              comments: p.comments,
            }))
            .reverse();
            
            setPosts(formattedPosts);
            setLoading(false);
          } catch (err) {
            console.error("Failed to fetch posts", err);
            setLoading(false);
          }
        }
      
        if (profileData) {
          fetchPosts();
        }
      }, [profileData]);      
    
    const handlePostClick = () => {
        setShowModal(true);
    }

    return (
        <div className={styles.container}>
            <Navigation hasNewDm={hasNewDm} />

            {/* HOME CONTENT CONTAINER */}
            <div className={styles.homeContainer}>
                <div className={styles.title}>
                  <h1 className={styles.header}>
                    News Feed
                    <img src="/assets/atriaLogo.png" alt="Atria" />
                  </h1>
                    <p>
                        A place to share general information and updates with members
                        of the Vancouver Food Justice Coalition.
                    </p>
                </div>

                {/* Post component */}
                {loading ? <div className={styles.newsfeedLoader}><Loader/></div> : null}
                {!loading && posts.length < 1 ? <div className={styles.emptyFeed}><i>Your feed is empty</i></div> : null}
                {posts.map((post) => (
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
                        userId={post.userId}
                        currentUserId={profileData?.id}
                        userImage={post.userImage}
                        postId={post.id}
                        setPosts={setPosts}
                    />
                ))}

                {/* New Post Modal */}
                {showModal && (
                <PostModal
                    title="New Post"
                    buttonText="POST"
                    onClose={() => setShowModal(false)}
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
