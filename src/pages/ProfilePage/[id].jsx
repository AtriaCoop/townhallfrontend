import styles from '@/pages/ProfilePage/ProfilePage.module.scss';
import Navigation from '@/components/Navigation/Navigation';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';

export default function ProfilePage({ hasNewDm }) {
  const router = useRouter();
  const { id } = router.query;
  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE || '';

  const [profileData, setProfileData] = useState(null);
  const [isCurrentUser, setIsCurrentUser] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;

    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.id?.toString() === id?.toString()) {
      setIsCurrentUser(true);
    }

    async function fetchProfile() {
      try {
        const response = await fetch(`${BASE_URL}/user/${id}/`);
        const data = await response.json();
        setProfileData(data.user);
      } catch (error) {
        console.error('Error fetching profile data:', error);
      }
    }

    fetchProfile();
  }, [id, router.isReady]);

  if (!profileData) return null;

  // User Logout
  async function userLogout() {
    await fetch(`${BASE_URL}/auth/logout/`, {
      method: "POST",
      credentials: "include",
    });

    localStorage.removeItem("user");
    router.push('/');
  }

  return (
    <div className={styles.container}>
      <Navigation hasNewDm={hasNewDm} />

      <div className={styles.profileContainer}>
        <img
          className={styles.profilePic}
          src={`${profileData.profile_image}`}
          alt="Profile Image"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/assets/ProfileImage.jpg'
          }}
        />
        <span className={styles.name}>
          {profileData.full_name}
        </span>

        <span className={styles.dateJoined}>
          Joined {formatDistanceToNow(new Date(profileData.date_joined), { addSuffix: true })}
        </span>

        <div className={styles.profileInfo}>
          <span>Title: {profileData.title}</span>
          <span>Primary Organization: {profileData.primary_organization}</span>
          <span>Other Organizations: {profileData.other_organizations}</span>
          <span>Other Networks: {profileData.other_networks}</span>
          <span>About Me: {profileData.about_me}</span>
          <span>My Skills & Interests: {profileData.skills_interests}</span>
        </div>

        {isCurrentUser && (
          <>
            <button
              onClick={() => router.push('/EditProfilePage')}
              className={styles.editButton}
            >
              EDIT MY PROFILE
            </button>

            <div className={styles.signoutContainer}>
              <p>Time to go?</p>
              <button
                onClick={userLogout}
                className={styles.signoutButton}
              >
                SIGN OUT
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
