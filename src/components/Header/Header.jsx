import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import Icon from '@/icons/Icon';
import { authenticatedFetch } from '@/utils/authHelpers';
import styles from './Header.module.scss';

export default function Header({ hasNewDm = false }) {
  const router = useRouter();
  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE || '';

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user || !user.id) {
          console.error("No user found in localStorage.");
          setLoading(false);
          return;
        }
        const response = await authenticatedFetch(`${BASE_URL}/user/${user.id}/`, {
          credentials: "include",
        });
        const data = await response.json();
        setProfileData(data.user);
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [BASE_URL]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push('/LandingPage');
  };

  const navigateTo = (path) => {
    setDropdownOpen(false);
    router.push(path);
  };

  return (
    <header className={styles.header}>
      {/* Left section - empty on desktop, could have breadcrumbs */}
      <div className={styles.leftSection}>
        {/* Mobile logo placeholder - actual menu button is in Sidebar */}
      </div>

      {/* Right section - icons and profile */}
      <div className={styles.rightSection}>
        {/* Atria Logo */}
        <img
          src="/assets/atriaLogo.png"
          alt="Powered by Atria"
          className={styles.atriaLogo}
        />

        <div className={styles.divider} />

        {/* Notification Bell */}
        <button className={styles.iconButton} aria-label="Notifications">
          <Icon name="bell" size={22} />
        </button>

        {/* Messages */}
        <button
          className={styles.iconButton}
          onClick={() => navigateTo('/DirectMessagesPage')}
          aria-label="Messages"
        >
          <Icon name="message" size={22} />
          {hasNewDm && <span className={styles.badge} />}
        </button>

        {/* Profile Dropdown */}
        <div className={styles.profileWrapper} ref={dropdownRef}>
          <button
            className={styles.profileButton}
            onClick={() => setDropdownOpen(!dropdownOpen)}
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
          >
            <img
              src={profileData?.profile_image || '/assets/ProfileImage.jpg'}
              alt="Profile"
              className={styles.avatar}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/assets/ProfileImage.jpg';
              }}
            />
            <Icon name="chevronDown" size={16} className={styles.chevron} />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className={styles.dropdown}>
              <div className={styles.dropdownHeader}>
                <img
                  src={profileData?.profile_image || '/assets/ProfileImage.jpg'}
                  alt="Profile"
                  className={styles.dropdownAvatar}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/assets/ProfileImage.jpg';
                  }}
                />
                <div className={styles.dropdownInfo}>
                  <span className={styles.dropdownName}>
                    {loading ? 'Loading...' : profileData?.full_name || 'User'}
                  </span>
                  <span className={styles.dropdownEmail}>
                    {profileData?.email || ''}
                  </span>
                </div>
              </div>

              <div className={styles.dropdownDivider} />

              <button
                className={styles.dropdownItem}
                onClick={() => navigateTo(`/ProfilePage/${profileData?.id}`)}
              >
                <Icon name="user" size={18} />
                <span>My Profile</span>
              </button>

              <button
                className={styles.dropdownItem}
                onClick={() => navigateTo('/SettingsPage')}
              >
                <Icon name="settings" size={18} />
                <span>Settings</span>
              </button>

              <div className={styles.dropdownDivider} />

              <button
                className={`${styles.dropdownItem} ${styles.logout}`}
                onClick={handleLogout}
              >
                <Icon name="leave" size={18} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
