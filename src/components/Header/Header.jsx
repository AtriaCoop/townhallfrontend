import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import Icon from '@/icons/Icon';
import { authenticatedFetch } from '@/utils/authHelpers';
import useNotificationStore from '@/stores/notificationStore';
import NotificationDropdown from '../NotificationDropdown/NotificationDropdown';
import MessageDropdown from '../MessageDropdown/MessageDropdown';
import styles from './Header.module.scss';

export default function Header() {
  const router = useRouter();
  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE || '';

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const bellRef = useRef(null);
  const messageRef = useRef(null);

  // Read notification state from Zustand
  const hasNewDm = useNotificationStore((s) => s.hasNewDm);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const unreadDmMap = useNotificationStore((s) => s.unreadDmMap);
  const bellDropdownOpen = useNotificationStore((s) => s.bellDropdownOpen);
  const toggleBellDropdown = useNotificationStore((s) => s.toggleBellDropdown);
  const closeBellDropdown = useNotificationStore((s) => s.closeBellDropdown);
  const messageDropdownOpen = useNotificationStore((s) => s.messageDropdownOpen);
  const toggleMessageDropdown = useNotificationStore((s) => s.toggleMessageDropdown);
  const closeMessageDropdown = useNotificationStore((s) => s.closeMessageDropdown);

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

  // Close any dropdown when clicking outside its wrapper
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (bellRef.current && !bellRef.current.contains(event.target)) {
        closeBellDropdown();
      }
      if (messageRef.current && !messageRef.current.contains(event.target)) {
        closeMessageDropdown();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [closeBellDropdown, closeMessageDropdown]);

  const handleLogout = async () => {
    try {
      await authenticatedFetch(`${BASE_URL}/auth/logout/`, {
        method: "POST",
      });
    } catch (error) {
      console.error("Logout error:", error);
    }
    localStorage.removeItem("user");
    router.push('/LandingPage');
  };

  const navigateTo = (path) => {
    setDropdownOpen(false);
    closeBellDropdown();
    closeMessageDropdown();
    router.push(path);
  };

  const dmCount = Object.values(unreadDmMap).reduce((sum, c) => sum + c, 0);

  return (
    <header className={styles.header}>
      {/* Left section - empty on desktop, could have breadcrumbs */}
      <div className={styles.leftSection}>
        {/* Mobile logo placeholder - actual menu button is in Sidebar */}
      </div>

      {/* Right section - icons and profile */}
      <div className={styles.rightSection}>
        {/* VFJC Logo */}
        <img
          src="/assets/VFJC.png"
          alt="VFJC Logo"
          className={styles.brandLogo}
        />
        <div className={styles.divider} />

        {/* Notification Bell with Dropdown */}
        <div className={styles.bellWrapper} ref={bellRef}>
          <button
            className={styles.iconButton}
            onClick={toggleBellDropdown}
            aria-label="Notifications"
            aria-expanded={bellDropdownOpen}
          >
            <Icon name="bell" size={22} />
            {unreadCount > 0 && (
              <span className={styles.countBadge}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>
          {bellDropdownOpen && <NotificationDropdown />}
        </div>

        {/* Messages with Dropdown */}
        <div className={styles.messageWrapper} ref={messageRef}>
          <button
            className={styles.iconButton}
            onClick={toggleMessageDropdown}
            aria-label="Messages"
            aria-expanded={messageDropdownOpen}
          >
            <Icon name="message" size={22} />
            {hasNewDm && dmCount > 0 && (
              <span className={styles.countBadge}>
                {dmCount > 99 ? '99+' : dmCount}
              </span>
            )}
          </button>
          {messageDropdownOpen && <MessageDropdown />}
        </div>

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
