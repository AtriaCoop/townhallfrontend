import Navigation from '@/components/Navigation/Navigation'
import styles from '@/pages/HomePage/HomePage.module.scss'
import Post from '@/components/Post/Post';
import { useEffect, useRef, useState } from 'react';

export default function HomePage() {
    const BASE_URL = process.env.NEXT_PUBLIC_API_BASE;

    const [showModal, setShowModal] = useState(false);
    const [posts, setPosts] = useState([]);
    const [newText, setNewText] = useState("")
    const [newImage, setNewImage] = useState(null)
    const [profileData, setProfileData] = useState(null)

    useEffect (() => {
        async function fetchProfile() {
          try {
            const user = JSON.parse(localStorage.getItem("user"));
            if (!user || !user.id) {
              console.error("No user found in localStorage.");
              return;
            }
            const response = await fetch (`${BASE_URL}/volunteer/${user.id}/`);
            const data = await response.json();
            setProfileData(data.volunteer);
          } catch(error) {
            console.error("Error fetching profile data:", error);
          }
        }
        fetchProfile();
      }, [])

      useEffect(() => {
        async function fetchPosts() {
          try {
            const res = await fetch(`${BASE_URL}/post/`);
            const data = await res.json();
      
            const formattedPosts = data.posts.map((p) => ({
              id: p.id,
              userName: `${profileData.first_name} ${profileData.last_name}`,
              organization: profileData.primary_organization,
              date: new Date(p.created_at).toLocaleString(),
              content: [p.content],
              links: [],
              likes: 0,
              comments: 0,
            }))
            .reverse();
      
            setPosts(formattedPosts);
          } catch (err) {
            console.error("Failed to fetch posts", err);
          }
        }
      
        if (profileData) {
          fetchPosts();
        }
      }, [profileData]);      
    
    const handlePostClick = () => {
        setShowModal(true);
    }

    const closeModal = () => {
        setShowModal(false);
    }

    const postImageRef = useRef(null);

    const handlePostImageClick = () => postImageRef.current.click()

    const handlePostImageChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith("image/")) {
          setNewImage(file);
        } else {
          alert("Please upload a valid image file.");
        }
    }

    return (
        <div className={styles.container}>
            <Navigation />

            {/* HOME CONTENT CONTAINER */}
            <div className={styles.homeContainer}>
                <div className={styles.title}>
                    <h1>News Feed</h1>
                    <p>
                        A place to share general information and updates with members
                        of the Vancouver Food Justice Coalition.
                    </p>
                </div>

                {/* Post component */}
                {posts.map((post) => (
                    <Post 
                        key={post.id}
                        userName={post.userName}
                        organization={post.organization}
                        date={post.date}
                        content={post.content}
                        links={post.links}
                        likes={post.likes}
                        comments={post.comments}
                    />
                ))}

                {/* New Post Modal */}
                {showModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <button className={styles.closeButton} onClick={closeModal}>×</button>
                        <h1>New Post</h1>
                        <p>Text</p>
                            <input 
                                type="text" 
                                placeholder='Enter text...' 
                                className={styles.textInput} 
                                value={newText} 
                                onChange={(e) => setNewText(e.target.value)}
                            />
                            <p>Profile Picture</p>
                        <div className={styles.imageInput} onClick={handlePostImageClick}>
                            Choose Photo
                        </div>
                        <input 
                            type="file" 
                            accept="image/*"
                            ref={postImageRef}
                            onChange={handlePostImageChange}
                            style={{ display: 'none '}}
                        />
                        <div className={styles.modalButton}>
                            <button 
                                className={styles.postButton}
                                onClick={async () => {
                                    if (!profileData || !newText) return;
                                  
                                    const formData = new FormData();
                                    formData.append("volunteer", profileData.id); // the volunteer ID
                                    formData.append("content", newText);
                                    if (newImage) {
                                      formData.append("image", newImage);
                                    }
                                  
                                    try {
                                      const response = await fetch(`${BASE_URL}/post/`, {
                                        method: "POST",
                                        body: formData,
                                      });
                                  
                                      if (!response.ok) {
                                        throw new Error("Failed to create post");
                                      }
                                  
                                      const data = await response.json();
                                      const newPost = {
                                        id: data.post.id,
                                        userName: `${profileData.first_name} ${profileData.last_name}`,
                                        organization: profileData.primary_organization,
                                        date: new Date(data.post.created_at).toLocaleString(),
                                        content: [data.post.content],
                                        links: [],
                                        likes: 0,
                                        comments: 0,
                                      };
                                  
                                      setPosts([newPost, ...posts]);
                                      setShowModal(false);
                                      setNewText("");
                                      setNewImage(null);
                                    } catch (error) {
                                      console.error("Error posting:", error);
                                    }
                                  }}                                  
                                >
                                    POST
                            </button>
                        </div>
                    </div>
                </div>
                )}

                {!showModal && (
                <div className={styles.newPostButton} onClick={handlePostClick}>
                    NEW POST
                </div>
                )}
                
            </div>

        </div>
    );
}
