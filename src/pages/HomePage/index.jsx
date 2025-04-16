import Navigation from '@/components/Navigation/Navigation'
import styles from '@/pages/HomePage/HomePage.module.scss'
import Post from '@/components/Post/Post';
import { useRef, useState } from 'react';

export default function HomePage() {

    const [showModal, setShowModal] = useState(false);
    
    const handlePostClick = () => {
        setShowModal(true);
    }

    const closeModal = () => {
        setShowModal(false);
    }

    const postImageRef = useRef(null);

    const handlePostImageClick = () => postImageRef.current.click()

    const handlePostImageChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            console.log('Selected post image', file)
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
                <Post
                    userName="Ryan Yee"
                    organization="Atria"
                    date="2025-03-14 1:03 p.m."
                    content={[
                        "Hi all, really enjoyed being at the meeting this week, connecting & re-connecting, thank you for the welcome and the work.",
                        "I wanted to share some links to some of the resources I mentioned..."
                    ]}
                    links={[
                        { text: "https://cfccanada.ca/en/News/...", href: "https://cfccanada.ca/en/News/Publications/Reports/Our-Food-Our-Future" },
                        { text: "Beyond Hunger", href: "https://drive.google.com/..." },
                        { text: "Sounding the Alarm", href: "https://drive.google.com/..." }
                    ]}
                    likes={4}
                    comments={1}
                />
                <Post
                    userName="Ryan Yee"
                    organization="Atria"
                    date="2025-03-14 1:03 p.m."
                    content={[
                        "Hi all, really enjoyed being at the meeting this week, connecting & re-connecting, thank you for the welcome and the work.",
                        "I wanted to share some links to some of the resources I mentioned..."
                    ]}
                    links={[
                        { text: "https://cfccanada.ca/en/News/...", href: "https://cfccanada.ca/en/News/Publications/Reports/Our-Food-Our-Future" },
                        { text: "Beyond Hunger", href: "https://drive.google.com/..." },
                        { text: "Sounding the Alarm", href: "https://drive.google.com/..." }
                    ]}
                    likes={4}
                    comments={1}
                />
                    <Post
                    userName="Ryan Yee"
                    organization="Atria"
                    date="2025-03-14 1:03 p.m."
                    content={[
                        "Hi all, really enjoyed being at the meeting this week, connecting & re-connecting, thank you for the welcome and the work.",
                        "I wanted to share some links to some of the resources I mentioned..."
                    ]}
                    links={[
                        { text: "https://cfccanada.ca/en/News/...", href: "https://cfccanada.ca/en/News/Publications/Reports/Our-Food-Our-Future" },
                        { text: "Beyond Hunger", href: "https://drive.google.com/..." },
                        { text: "Sounding the Alarm", href: "https://drive.google.com/..." }
                    ]}
                    likes={4}
                    comments={1}
                />

                {/* New Post Modal */}
                {showModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <button className={styles.closeButton} onClick={closeModal}>×</button>
                        <h1>New Post</h1>
                        <p>Text</p>
                            <input type="text" placeholder='Enter text...' className={styles.textInput}/>
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
                            <button className={styles.postButton}>POST</button>
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
