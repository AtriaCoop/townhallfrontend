import styles from '@/pages/ProfilePage/ProfilePage.module.scss'
import Navigation from '@/components/Navigation/Navigation'
import { useRouter } from 'next/router';

export default function ProfilePage() {

    const router = useRouter();

    return (
        <div className={styles.container}>
            <Navigation />

            <div className={styles.profileContainer}>
                <img className={styles.profilePic} src="/assets/test.png" alt="Profile Image" />
                <span className={styles.name}>Ryan Yee</span>
                <span className={styles.dateJoined}>Date Joined: 2 weeks ago</span>
                <div className={styles.profileInfo}>
                    <span>Title: Volunteer</span>
                    <span>Primary Organization: Atria</span>
                    <span>Other Organizations: other</span>
                    <span>Other Networks: other</span>
                    <span>About Me: other</span>
                    <span>My Skills & Interests: other</span>
                </div>
                <button onClick={() => router.push('/EditProfilePage')} className={styles.editButton}>EDIT MY PROFILE</button>
                
                <div className={styles.signoutContainer}>
                    <p>Time to go?</p>
                    <button onClick={() => router.push('/')} className={styles.signoutButton}>
                        SIGN OUT
                    </button>
                </div>
            </div>

        </div>
    )
}