import styles from '@/pages/EditProfilePage/EditProfilePage.module.scss'
import Navigation from '@/components/Navigation/Navigation'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router';
import { authenticatedFetch } from '@/utils/authHelpers';

export default function EditProfilePage({ hasNewDm }) {

    const BASE_URL = process.env.NEXT_PUBLIC_API_BASE || '';
    const router = useRouter();

    const [showModal, setShowModal] = useState(false);
    const [profileData, setProfileData] = useState(null);
    const [formData, setFormData] = useState({
        full_name: "",
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
    const [saveStatus, setSaveStatus] = useState(null); // 'success' | 'error' | null
    const [saveMessage, setSaveMessage] = useState("");
    const dismissTimerRef = useRef(null);

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
      
            const response = await authenticatedFetch(`${BASE_URL}/user/${user.id}/`);
            const data = await response.json();
            setProfileData(data.user);
            setFormData((prev) => ({
              ...prev,
              ...data.user,
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
          setSaveStatus('error');
          setSaveMessage('No user found. Please sign in again.');
          return { ok: false, message: 'No user ID found' };
        }
      
        const form = new FormData();
      
        form.append("full_name", formData.full_name);
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
          const response = await authenticatedFetch(`${BASE_URL}/user/${user.id}/`, {
            method: "PATCH",
            body: form,
          });
      
          const data = await response.json();
          if (!response.ok) {
            // Use backend error message or create specific message based on status
            let errorMessage = data.message || data.error || data.detail;
            if (!errorMessage) {
              switch (response.status) {
                case 400: errorMessage = "Invalid data provided"; break;
                case 401: errorMessage = "Please sign in again"; break;
                case 403: errorMessage = "You don't have permission to update this profile"; break;
                case 404: errorMessage = "Profile not found"; break;
                case 500: errorMessage = "Server error occurred"; break;
                default: errorMessage = `Update failed (${response.status})`;
              }
            }
            throw new Error(errorMessage);
          }
          console.log("Profile updated", data);
          return { ok: true, message: data.message || 'Profile saved successfully.' };
        } catch (err) {
          console.error("Failed to update profile:", err);
          return { ok: false, message: err?.message || 'Failed to save profile.' };
        }
      }      

    useEffect(() => {
        if (!saveStatus) return;
        if (dismissTimerRef.current) {
            clearTimeout(dismissTimerRef.current);
        }
        dismissTimerRef.current = setTimeout(() => {
            setSaveStatus(null);
            setSaveMessage("");
        }, 3500);
        return () => {
            if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
        };
    }, [saveStatus]);

    function handleFieldChange(patch) {
        setFormData({ ...formData, ...patch });
        if (saveStatus) {
            setSaveStatus(null);
            setSaveMessage("");
            if (dismissTimerRef.current) {
                clearTimeout(dismissTimerRef.current);
            }
        }
    }

    return (
        <div className={styles.container}>
            <Navigation hasNewDm={hasNewDm} />

            <div className={styles.editProfileContainer}>
                <div className={styles.title}>
                    <div className={styles.backBox} onClick={() => (router.push(`/ProfilePage/${profileData.id}`))}>
                        <img src="/assets/leftArrow.png" alt="arrow"></img>
                    </div>
                    <h1>Account Settings</h1>
                </div>
                {saveStatus && (
                    <div className={`${styles.toast} ${saveStatus === 'success' ? styles.toastSuccess : styles.toastError}`} role="status" aria-live="assertive">
                        {saveMessage}
                    </div>
                )}
                <label className={styles.profilePic} 
                        htmlFor="profileImageUpload">
                    <img className={styles.profilePic} 
                        src={
                            formData.profile_image instanceof File
                                ? URL.createObjectURL(formData.profile_image)
                                : profileData?.profile_image 
                                    ? profileData.profile_image
                                    : '/assets/ProfileImage.jpg'
                            }
                        alt="Profile Image"
                        title="Click to change"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/assets/ProfileImage.jpg';
                        }}
                    />
                </label>
                <input
                    id="profileImageUpload"
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => handleFieldChange({ profile_image: e.target.files[0] })}
                    />
                <h3 className={styles.name}>{profileData?.full_name}</h3>
            </div>

            <div className={styles.inputs}>
                    <p>Full Name</p>
                        <input
                            type="text"
                            placeholder='Enter full name...'
                            value={formData.full_name}
                            onChange={(e) => handleFieldChange({ full_name: e.target.value })}
                        />
                    <p>Preferred Pronouns</p>
                        <input 
                            type="text"
                            placeholder='Share your pronouns (Optional)'
                            value={formData.pronouns}
                            onChange={(e) => handleFieldChange({ pronouns: e.target.value })}
                        />
                    <p>Title</p>
                        <input
                            type="text"
                            placeholder='Enter title...'
                            value={formData.title}
                            onChange={(e) => handleFieldChange({ title: e.target.value })}
                        />
                    <p>Primary Organization</p>
                        <input
                            type="text"
                            placeholder='What is the main organization you work for?'
                            value={formData.primary_organization}
                            onChange={(e) => handleFieldChange({ primary_organization: e.target.value })}
                        />
                    <p>Other Organizations</p>
                        <input
                            type="text"
                            placeholder='Enter other organizations you are a part of...'
                            value={formData.other_organizations}
                            onChange={(e) => handleFieldChange({ other_organizations: e.target.value })}
                        />
                    <p>Other Networks</p>
                        <input
                            type="text"
                            placeholder='List any coalitions or networks you are connected to other than the VFJC.'
                            value={formData.other_networks}
                            onChange={(e) => handleFieldChange({ other_networks: e.target.value })}
                        />
                    <p>About Me</p>
                        <input
                            type="text"
                            placeholder='Tell us about yourself!'
                            value={formData.about_me}
                            onChange={(e) => handleFieldChange({ about_me: e.target.value })}
                        />
                    <p>Skills & Interests</p>
                        <input
                            type="text"
                            placeholder='Enter any skills & interests that may benfeit the coalition.'
                            value={formData.skills_interests}
                            onChange={(e) => handleFieldChange({ skills_interests: e.target.value })}
                        />

                    <p>Profile Header</p>
                        <div className={styles.profileHeaderInput}>
                            <img
                                src={
                                formData.profile_header instanceof File
                                    ? URL.createObjectURL(formData.profile_header)
                                    : profileData?.profile_header
                                }
                                alt="Profile Header"
                                title="Click to change"
                                className={styles.clickableImage}
                            />
                        </div>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFieldChange({ profile_header: e.target.files[0] })}
                            style={{ display: 'none' }}
                        />

                    <button
                        className={styles.saveButton}
                        onClick={async () => {
                            const result = await updateProfile();
                            if (result?.ok) {
                                const message = result.message || 'Profile saved successfully.';
                                console.log('✅ Success:', message);
                                try {
                                    sessionStorage.setItem('toastAfterNav', JSON.stringify({ type: 'success', message }));
                                } catch (e) {}
                                router.push(`/ProfilePage/${profileData.id}`)
                            } else {
                                const errorMessage = result?.message || 'Failed to save profile.';
                                setSaveStatus('error');
                                setSaveMessage(errorMessage);
                                console.error('❌ Error:', errorMessage);
                            }
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