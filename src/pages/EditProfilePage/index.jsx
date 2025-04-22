import styles from '@/pages/EditProfilePage/EditProfilePage.module.scss'
import Navigation from '@/components/Navigation/Navigation'
import { useState } from 'react'
import { useRouter } from 'next/router';

export default function EditProfilePage() {

    const router = useRouter();

    const [showModal, setShowModal] = useState(false);

    const handleDeleteClick = () => {
        setShowModal(true);
    }

    const closeModal = () => {
        setShowModal(false);
    }

    return (
        <div className={styles.container}>
            <Navigation />

            <div className={styles.editProfileContainer}>
                <div className={styles.title}>
                    <img src="/assets/test.png" alt="Back" onClick={() => (router.push('/ProfilePage'))}/>
                    <h1>Account Settings</h1>
                </div>
                <img className={styles.profilePic} src="/assets/test.png" alt="Profile Image" />
                <h3 className={styles.name}>Ryan Yee</h3>
            </div>

            <div className={styles.inputs}>
                    <p>Email</p>
                        <input type="text" placeholder='Enter email...'/>
                    <p>First Name</p>
                        <input type="text" placeholder='Enter first name...'/>
                    <p>Last Name</p>
                        <input type="text" placeholder='Enter last name...'/>
                    <p>Preferred Pronouns</p>
                        <input type="text" placeholder='Share your pronouns (Optional)'/>
                    <p>Title</p>
                        <input type="text" placeholder='Enter title...'/>
                    <p>Primary Organization</p>
                        <input type="text" placeholder='What is the main organization you work for?'/>
                    <p>Other Organizations</p>
                        <input type="text" placeholder='Enter other organizations you are a part of...'/>
                    <p>Other Networks</p>
                        <input type="text" placeholder='List any coalitions or networks you are connected to other than the VFJC.'/>
                    <p>About Me</p>
                        <input type="text" placeholder='Tell us about yourself!'/>
                    <p>Skills & Interests</p>
                        <input type="text" placeholder='Enter any skills & interests that may benfeit the coalition.'/>
                    <p>Profile Image</p>
                        <div className={styles.profileImageInput}>
                            <img src="/assets/test.png" alt="Profile Image" />
                        </div>
                            <input type="file" accept="image/*" style={{ display: 'none' }}/>
                    <p>Profile Header</p>
                        <div className={styles.profileHeaderInput}>
                            <img src="/assets/test.png" alt="Profile Header" />
                        </div>
                            <input type="file" accept="image/*" style={{ display: 'none' }}/>

                    <button className={styles.saveButton}>SAVE</button>
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