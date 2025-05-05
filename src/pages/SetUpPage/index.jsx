import styles from '@/pages/SetUpPage/SetUpPage.module.scss'
import { useRef } from 'react'
import { useRouter } from 'next/router'
import { useState } from 'react';

export default function SetUpPage() {

    const BASE_URL = process.env.NEXT_PUBLIC_API_BASE;
    const form = new FormData();

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        pronouns: '',
        title: '',
        primary_organization: '',
        other_organizations: '',
        other_networks: '',
        about_me: '',
        skills_interests: ''
    });
    const [profilePreview, setProfilePreview] = useState(null)

    const router = useRouter();

    const profilePicRef = useRef(null)
    const headerPicRef = useRef(null)

    const handleProfileUploadClick = () => profilePicRef.current.click()

    const handleHeaderUploadClick = () => headerPicRef.current.click()

    const handleProfilePicChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setProfilePreview(URL.createObjectURL(file));
            console.log('Selected profile picture:', file)
        }
    }

    const handleHeaderPicChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            console.log('Selected header picture:', file)
        }
    }

    const handleCompleteClick = async () => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !user.id) {
            console.error("No user found in localStorage.");
            return;
        }

        // Append all text fields
        for (const key in formData) {
            form.append(key, formData[key]);
        }

        // Append profile image if selected
        if (profilePicRef.current.files[0]) {
            form.append("profile_image", profilePicRef.current.files[0]);
        }

        console.log("📦 Sending PATCH to backend with:", formData);
    
        try {
            const response = await fetch(`${BASE_URL}/volunteer/${user.id}/complete_profile/`, {
                method: 'POST',
                body: form,
            });
    
            if (response.ok) {
                console.log("Profile updated with image!");
                router.push('/');
            } else {
                const data = await response.json();
                console.error("Error updating profile:", data);
            }
        } catch (err) {
            console.error("Request failed:", err);
        }
    };    

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
                    <p>First Name</p>
                        <input type="text" placeholder='Enter first name...' value={formData.first_name} onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}/>
                    <p>Last Name</p>
                        <input type="text" placeholder='Enter last name...' value={formData.last_name} onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}/>
                    <p>Preferred Pronouns</p>
                        <input type="text" placeholder='What are your pronouns?' value={formData.pronouns} onChange={(e) => setFormData(prev => ({ ...prev, pronouns: e.target.value }))}/>
                    <p>Title</p>
                        <input type="text" placeholder='What is your job title?' value={formData.title} onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}/>
                    <p>Primary Organization</p>
                        <input type="text" placeholder='What organization do you work for?' value={formData.primary_organization} onChange={(e) => setFormData(prev => ({ ...prev, primary_organization: e.target.value }))}/>
                    <p>Other Organizations</p>
                        <input type="text" placeholder='Are there other organizations you work for?' value={formData.other_organizations} onChange={(e) => setFormData(prev => ({ ...prev, other_organizations: e.target.value }))}/>
                    <p>Other Networks</p>
                        <input type="text" placeholder='List any coalitions or networks you are a part of' value={formData.other_networks} onChange={(e) => setFormData(prev => ({ ...prev, other_networks: e.target.value }))}/>
                    <p>About Me</p>
                        <input type="text" placeholder='Where are you from? What do you like to do outside of work? Why is food security important to you?' value={formData.about_me} onChange={(e) => setFormData(prev => ({ ...prev, about_me: e.target.value }))}/>
                    <p>Skills & Interests</p>
                        <input type="text" placeholder='Are there specific ways you’d like to contribute to the coalition?' value={formData.skills_interests} onChange={(e) => setFormData(prev => ({ ...prev, skills_interests: e.target.value }))}/>
                    <p>Profile Picture</p>
                    <div className={styles.uploadButton} onClick={handleProfileUploadClick}>
                        {profilePreview ? (
                            <img src={profilePreview} alt="Preview" className={styles.previewImage} />
                        ) : (
                            <span>Upload Photo</span>
                        )}
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
                    
                    <button className={styles.completeButton} onClick={handleCompleteClick}>Complete</button>
                </div>
            </div>

        </div>
    )
}