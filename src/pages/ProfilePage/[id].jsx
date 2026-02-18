import { useRouter } from "next/router";
import { useState, useEffect, useRef } from "react";
import { formatDistanceToNow } from "date-fns";
import { authenticatedFetch } from "@/utils/authHelpers";
import SocialLinks from "@/components/SocialLinks/SocialLinks";
import styles from "./ProfilePage.module.scss";

export default function ProfilePage({ hasNewDm = false }) {
  const router = useRouter();
  const { id } = router.query;
  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE || "";

  const [profileData, setProfileData] = useState(null);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [toast, setToast] = useState(null);
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
  }, [id, router.isReady, BASE_URL]);

  useEffect(() => {
    if (!toast) return;
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 6000);
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, [toast]);

  if (!profileData) return null;

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
            <Icon name="edit" className={styles.icon} />
            Edit Profile
          </button>
        )}

      {/* --- name + pronouns --- */}
      <div className={styles.nameRow}>
        <div className={styles.name}>{profileData.full_name}</div>
        {profileData.pronouns && (
          <div className={styles.pronouns}>{profileData.pronouns}</div>
        )}
      </div>

      {/* --- pronunciation line (optional) --- */}
      {profileData.name_pronunciation && (
        <div className={styles.pronunciation}>
          <strong>Name pronunciation:</strong> {profileData.name_pronunciation}
        </div>
      )}

        <div className={styles.dateJoined}>
          Joined{" "}
          {formatDistanceToNow(new Date(profileData.date_joined), {
            addSuffix: true,
          })}
        </div>
      </div>

    <div className={styles.profilePage}>
      {/* Toast Notification */}
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

      {/* Cover Image Section */}
      <div className={styles.coverSection}>
        <div className={styles.coverImage}>
          {profileData.profile_header ? (
            <img
              src={profileData.profile_header}
              alt="Profile banner"
              className={styles.coverBannerImg}
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = "none";
              }}
            />
          ) : (
            <>
              <div className={styles.coverOverlay} />
              <div className={styles.coverIllustration}>
                <svg viewBox="0 0 200 100" className={styles.silhouettes}>
                  <circle cx="50" cy="40" r="15" fill="currentColor" opacity="0.3" />
                  <path d="M35 100 Q50 60 65 100" fill="currentColor" opacity="0.3" />
                  <circle cx="100" cy="35" r="18" fill="currentColor" opacity="0.4" />
                  <path d="M80 100 Q100 55 120 100" fill="currentColor" opacity="0.4" />
                  <circle cx="150" cy="40" r="15" fill="currentColor" opacity="0.3" />
                  <path d="M135 100 Q150 60 165 100" fill="currentColor" opacity="0.3" />
                </svg>
              </div>
            </>
          )}
        </div>

        {/* Profile Avatar */}
        <div className={styles.avatarWrapper}>
          <img
            src={profileData.profile_image || "/assets/ProfileImage.jpg"}
            alt={profileData.full_name}
            className={styles.avatar}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/assets/ProfileImage.jpg";
            }}
          />
        </div>

        {/* Name and Edit Button */}
        <div className={styles.profileHeader}>
          <h1 className={styles.name}>{profileData.full_name}</h1>
          {isCurrentUser && (
            <button
              onClick={() => router.push("/EditProfilePage")}
              className={styles.editButton}
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Content Cards */}
      <div className={styles.contentGrid}>
        {/* Basic Information Card */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Basic Information</h2>
          <div className={styles.infoList}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Name:</span>
              <span className={styles.infoValue}>{profileData.full_name}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Email:</span>
              <span className={styles.infoValue}>{profileData.email}</span>
            </div>
            {profileData.title && (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Title:</span>
                <span className={styles.infoValue}>{profileData.title}</span>
              </div>
            )}
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Joined:</span>
              <span className={styles.infoValue}>
                {formatDistanceToNow(new Date(profileData.date_joined), {
                  addSuffix: true,
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Details Card */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Details</h2>

          {/* About Section */}
          {profileData.about_me && (
            <div className={styles.detailSection}>
              <h3 className={styles.detailLabel}>About</h3>
              <p className={styles.detailContent}>{profileData.about_me}</p>
            </div>
          )}

          {/* Organizations Section */}
          {profileData.primary_organization && (
            <div className={styles.detailSection}>
              <h3 className={styles.detailLabel}>Organizations</h3>
              <p className={styles.detailContent}>
                {profileData.primary_organization}
                {profileData.other_organizations && (
                  <>, {profileData.other_organizations}</>
                )}
              </p>
            </div>
          )}

          {/* Skills & Interests */}
          {profileData.skills_interests && (
            <div className={styles.detailSection}>
              <h3 className={styles.detailLabel}>Skills & Interests</h3>
              <p className={styles.detailContent}>{profileData.skills_interests}</p>
            </div>
          )}

          {/* Networks */}
          {profileData.other_networks && (
            <div className={styles.detailSection}>
              <h3 className={styles.detailLabel}>Other Networks</h3>
              <p className={styles.detailContent}>{profileData.other_networks}</p>
            </div>
          )}
        </div>

        {/* Social Links Card */}
        {(profileData.linkedin_url ||
          profileData.x_url ||
          profileData.facebook_url ||
          profileData.instagram_url) && (
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Social Links</h2>
            <SocialLinks
              socialLinks={{
                linkedin_url: profileData.linkedin_url,
                x_url: profileData.x_url,
                facebook_url: profileData.facebook_url,
                instagram_url: profileData.instagram_url,
              }}
            />
          </div>
        )}

      </div>
    </div>
    </div>
  );
}
