import styles from "@/pages/ProfilePage/ProfilePage.module.scss";
import Navigation from "@/components/Navigation/Navigation";
import { useRouter } from "next/router";
import { useState, useEffect, useRef } from "react";
import { formatDistanceToNow } from "date-fns";
import { FaEdit, FaSignOutAlt } from "react-icons/fa";

import { authenticatedFetch } from "@/utils/authHelpers";
import SocialLinks from "@/components/SocialLinks/SocialLinks";

export default function ProfilePage({ hasNewDm }) {
  const router = useRouter();
  const { id } = router.query;
  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE || "";

  const [profileData, setProfileData] = useState(null);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [toast, setToast] = useState(null); // { type: 'success'|'error', message: string }
  const toastTimerRef = useRef(null);

  useEffect(() => {
    if (!router.isReady) return;

    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.id?.toString() === id?.toString()) {
      setIsCurrentUser(true);
    }

    async function fetchProfile() {
      try {
        const response = await authenticatedFetch(`${BASE_URL}/user/${id}/`);
        const data = await response.json();
        setProfileData(data.user);
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    }

    fetchProfile();

    // Check for deferred toast from previous page
    try {
      const queued = sessionStorage.getItem("toastAfterNav");
      if (queued) {
        const parsed = JSON.parse(queued);
        setToast(parsed);
        sessionStorage.removeItem("toastAfterNav");
      }
    } catch (e) {
      // no-op
    }
  }, [id, router.isReady]);

  useEffect(() => {
    if (!toast) return;
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 6000);
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, [toast]);

  if (!profileData) return null;

  async function userLogout() {
    await authenticatedFetch(`${BASE_URL}/auth/logout/`, {
      method: "POST",
    });

    localStorage.removeItem("user");
    router.push("/");
  }

  return (
    <div className={styles.container}>
      <Navigation hasNewDm={hasNewDm} />

      <div className={styles.profileContainer}>
        {toast && (
          <div
            className={`${styles.toast} ${
              toast.type === "success" ? styles.toastSuccess : styles.toastError
            }`}
            role="status"
            aria-live="assertive"
          >
            {toast.message}
          </div>
        )}
        <div className={styles.cardHeader}>Profile Overview</div>

        <img
          className={styles.profilePic}
          src={profileData.profile_image || "/assets/ProfileImage.jpg"}
          alt="Profile"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "/assets/ProfileImage.jpg";
          }}
        />

        {isCurrentUser && (
          <button
            onClick={() => router.push("/EditProfilePage")}
            className={styles.editButtonInline}
          >
            <FaEdit style={{ marginRight: "0.4rem" }} />
            Edit Profile
          </button>
        )}

        <div className={styles.name}>{profileData.full_name}</div>
        <div className={styles.dateJoined}>
          Joined{" "}
          {formatDistanceToNow(new Date(profileData.date_joined), {
            addSuffix: true,
          })}
        </div>

        <div className={styles.sectionTitle}>👤 Details</div>
        <div className={styles.profileInfo}>
          <div>
            <strong>Title:</strong> {profileData.title}
          </div>
          <div>
            <strong>Primary Organization:</strong>{" "}
            {profileData.primary_organization}
          </div>
          <div>
            <strong>Other Organizations:</strong>{" "}
            {profileData.other_organizations}
          </div>
          <div>
            <strong>Other Networks:</strong> {profileData.other_networks}
          </div>
        </div>

        <div className={styles.sectionTitle}>📝 About</div>
        <div className={styles.aboutBox}>
          <div>
            <strong>About Me:</strong> {profileData.about_me}
          </div>
          <div>
            <strong>Skills & Interests:</strong> {profileData.skills_interests}
          </div>
        </div>

        {(profileData.linkedin_url ||
          profileData.x_url ||
          profileData.facebook_url ||
          profileData.instagram_url) && (
          <>
            <div className={styles.sectionTitle}>🔗 Social Links</div>
            <SocialLinks
              socialLinks={{
                linkedin_url: profileData.linkedin_url,
                x_url: profileData.x_url,
                facebook_url: profileData.facebook_url,
                instagram_url: profileData.instagram_url,
              }}
            />
          </>
        )}

        {isCurrentUser && (
          <>
            <button
              onClick={userLogout}
              className={styles.signoutFloatingButton}
            >
              <FaSignOutAlt />
              Sign Out
            </button>
          </>
        )}
      </div>
    </div>
  );
}
