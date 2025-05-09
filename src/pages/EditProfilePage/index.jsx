import styles from '@/pages/EditProfilePage/EditProfilePage.module.scss'
import Navigation from '@/components/Navigation/Navigation'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router';

export default function EditProfilePage() {

    const BASE_URL = process.env.NEXT_PUBLIC_API_BASE;
    const router = useRouter();

    const [showModal, setShowModal] = useState(false);
    const [profileData, setProfileData] = useState(null);
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        pronouns: "",
        title: "",
        primary_organization: "",
        other_organizations: "",
        other_networks: "",
        about_me: "",
        skills_interests: "",
        profile_image: null,
        profile_header: null,
    });

    const handleDeleteClick = () => {
        setShowModal(true);
    }

    const closeModal = () => {
        setShowModal(false);
    }

    useEffect(() => {
        async function fetchProfile() {
          try {
            const user = JSON.parse(localStorage.getItem("user"));
            if (!user || !user.id) return;
      
            const response = await fetch(`${BASE_URL}/volunteer/${user.id}/`);
            const data = await response.json();
            setProfileData(data.volunteer);
            setFormData((prev) => ({
              ...prev,
              ...data.volunteer,
            }));
          } catch (error) {
            console.error("Error fetching profile data:", error);
          }
        }
        fetchProfile();
      }, []);      

    async function updateProfile() {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user?.id) {
          console.error("No user ID found.");
          return;
        }
      
        const form = new FormData();
      
        form.append("first_name", formData.first_name);
        form.append("last_name", formData.last_name);
        form.append("pronouns", formData.pronouns);
        form.append("title", formData.title);
        form.append("primary_organization", formData.primary_organization);
        form.append("other_organizations", formData.other_organizations);
        form.append("other_networks", formData.other_networks);
        form.append("about_me", formData.about_me);
        form.append("skills_interests", formData.skills_interests);
        
        // Handle image files (if added)
        if (formData.profile_image instanceof File) {
          form.append("profile_image", formData.profile_image);
        }
        if (formData.profile_header instanceof File) {
            form.append("profile_header", formData.profile_header);
        }
      
        try {
          const response = await fetch(`${BASE_URL}/volunteer/${user.id}/`, {
            method: "PATCH",
            body: form,
          });
      
          const data = await response.json();
          if (!response.ok) throw new Error(data.message || "Update failed");
          console.log("Profile updated", data);
        } catch (err) {
          console.error("Failed to update profile:", err);
        }
      }       

    return (
        <div className={styles.container}>
            <Navigation />

            <div className={styles.editProfileContainer}>
                <div className={styles.title}>
                    <div className={styles.backBox} onClick={() => (router.push(`/ProfilePage/${profileData.id}`))}>
                        <img src="/assets/leftArrow.png" alt="arrow"></img>
                    </div>
                    <h1>Account Settings</h1>
                </div>
                <img className={styles.profilePic} src={`${BASE_URL}${profileData?.profile_image}`}
                    alt="Profile Image"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/assets/ProfileImage.jpg';
                    }}
                />
                <h3 className={styles.name}>{profileData?.first_name} {profileData?.last_name}</h3>
            </div>

            <div className={styles.inputs}>
                    <p>First Name</p>
                        <input
                            type="text"
                            placeholder='Enter first name...'
                            value={formData.first_name}
                            onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                        />
                    <p>Last Name</p>
                        <input
                            type="text"
                            placeholder='Enter last name...'
                            value={formData.last_name}
                            onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                        />
                    <p>Preferred Pronouns</p>
                        <input 
                            type="text"
                            placeholder='Share your pronouns (Optional)'
                            value={formData.pronouns}
                            onChange={(e) => setFormData({...formData, pronouns: e.target.value})}
                        />
                    <p>Title</p>
                        <input
                            type="text"
                            placeholder='Enter title...'
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                        />
                    <p>Primary Organization</p>
                        <input
                            type="text"
                            placeholder='What is the main organization you work for?'
                            value={formData.primary_organization}
                            onChange={(e) => setFormData({...formData, primary_organization: e.target.value})}
                        />
                    <p>Other Organizations</p>
                        <input
                            type="text"
                            placeholder='Enter other organizations you are a part of...'
                            value={formData.other_organizations}
                            onChange={(e) => setFormData({...formData, other_organizations: e.target.value})}
                        />
                    <p>Other Networks</p>
                        <input
                            type="text"
                            placeholder='List any coalitions or networks you are connected to other than the VFJC.'
                            value={formData.other_networks}
                            onChange={(e) => setFormData({...formData, other_networks: e.target.value})}
                        />
                    <p>About Me</p>
                        <input
                            type="text"
                            placeholder='Tell us about yourself!'
                            value={formData.about_me}
                            onChange={(e) => setFormData({...formData, about_me: e.target.value})}
                        />
                    <p>Skills & Interests</p>
                        <input
                            type="text"
                            placeholder='Enter any skills & interests that may benfeit the coalition.'
                            value={formData.skills_interests}
                            onChange={(e) => setFormData({...formData, skills_interests: e.target.value})}
                        />
                    <p>Profile Image</p>
                    <label className={styles.profileImageInput} htmlFor="profileImageUpload">
                    <img
                        src={
                        formData.profile_image instanceof File
                            ? URL.createObjectURL(formData.profile_image)
                            : `${BASE_URL}${profileData?.profile_image}`
                        }
                        alt="Profile Image"
                        title="Click to change"
                        className={styles.clickableImage}
                    />
                    </label>
                    <input
                    id="profileImageUpload"
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => setFormData({ ...formData, profile_image: e.target.files[0] })}
                    />

                    <p>Profile Header</p>
                        <div className={styles.profileHeaderInput}>
                            <img src="/assets/test.png" alt="Profile Header" />
                        </div>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setFormData({ ...formData, profile_header: e.target.files[0] })}
                                style={{ display: 'none' }}
                            />

                    <button
                        className={styles.saveButton}
                        onClick={async () => {
                            await updateProfile();
                            router.push(`/ProfilePage/${profileData.id}`)
                        }}>
                            SAVE
                    </button>
                </div>

                {/* Delete account modal */}
                {showModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <h1>Delete Account?</h1>
                        <p>Are you sure you want to delete your account? You can't undo this.</p>
                        <div className={styles.modalButton}>
                            <button className={styles.delete}>DELETE MY ACCOUNT</button>
                            <button className={styles.cancel} onClick={closeModal}>Cancel</button>
                        </div>
                    </div>
                </div>
                )}

                <div className={styles.deleteButton} onClick={handleDeleteClick}>
                    <p>DELETE ACCOUNT</p>
                </div>

        </div>
    )
}