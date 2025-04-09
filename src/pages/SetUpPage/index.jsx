import styles from '@/pages/SetUpPage/SetUpPage.module.scss'
import { useRef } from 'react'

export default function SetUpPage() {

    const profilePicRef = useRef(null)
    const headerPicRef = useRef(null)

    const handleProfileUploadClick = () => profilePicRef.current.click()

    const handleHeaderUploadClick = () => headerPicRef.current.click()

    const handleProfilePicChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            console.log('Selected profile picture:', file)
        }
    }

    const handleHeaderPicChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            console.log('Selected header picture:', file)
        }
    }

    return (
        <div>
            
            {/* Navigation */}
            <div className={styles.navigationContainer}>
                <div className={styles.navigation}>
                    <img src="/assets/test.png" alt="Overview" />
                    <p>Overview</p>
                </div>
                <div className={styles.navigation}>
                    <img src="/assets/test.png" alt="Complete" />
                    <p>Complete</p>
                </div>
            </div>

            {/* Set Up */}
            <div className={styles.setUpContainer}>
                <div className={styles.title}>
                    <h2>Let's set up your profile</h2>
                    <p>We'll start  with the basics:</p>
                </div>
                <div className={styles.inputs}>
                    <p>Full Name</p>
                        <input type="text" placeholder='Enter full name...'/>
                    <p>Preferred Pronouns</p>
                        <input type="text" placeholder='What are your pronouns?'/>
                    <p>Title</p>
                        <input type="text" placeholder='What is your job title?'/>
                    <p>Primary Organization</p>
                        <input type="text" placeholder='What organization do you work for?'/>
                    <p>Other Organizations</p>
                        <input type="text" placeholder='Are there other organizations you work for?'/>
                    <p>Other Networks</p>
                        <input type="text" placeholder='List any coalitions or networks you are a part of'/>
                    <p>About Me</p>
                        <input type="text" placeholder='Where are you from? What do you like to do outside of work? Why is food security important to you?'/>
                    <p>Skills & Interests</p>
                        <input type="text" placeholder='Are there specific ways you’d like to contribute to the coalition?'/>
                    <p>Profile Picture</p>
                        <div className={styles.uploadButton} onClick={handleProfileUploadClick}>
                            Upload Photo
                        </div>
                        <input 
                            type="file" 
                            accept="image/*" 
                            ref={profilePicRef}
                            onChange={handleProfilePicChange}
                            style={{ display: 'none '}}
                        />
                    <p>Profile Header Photo</p>
                        <div className={styles.uploadButton} onClick={handleHeaderUploadClick}>
                            Upload Header Photo
                        </div>
                        <input 
                            type="file" 
                            accept="image/*" 
                            ref={headerPicRef}
                            onChange={handleHeaderPicChange}
                            style={{ display: 'none '}}
                        />
                    
                    <button className={styles.completeButton}>Complete</button>
                </div>
            </div>

        </div>
    )
}