import styles from './Navigation.module.scss';
import { Menu, LayoutDashboard, User, Users, MessageSquare, Home, CircleAlert } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { authenticatedFetch } from '@/utils/authHelpers';
import ReportModal from '@/components/ReportModal/ReportModal';

export default function Navigation({ hasNewDm = false }) {

  const pathname = usePathname();
  const router = useRouter();
  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE || '';

  const [loading, setLoading] = useState(true)
  const [profileData, setProfileData] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);

  const handleReportClick = () => {
    setShowReportModal(true);
  };

  useEffect (() => {
    async function fetchProfile() {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user || !user.id) {
          console.error("No user found in localStorage.");
          return;
        }
        const response = await authenticatedFetch(`${BASE_URL}/user/${user.id}/`, {
          credentials: "include",
        });
        const data = await response.json();
        setProfileData(data.user);
        setLoading(false)
      } catch {
        console.error("Error fetching profile data:", error);
        setLoading(false)
      }
    }
    fetchProfile();
  }, [])
  
  return (
    <div className={styles.nav}>

      {/* Mobile burger menu */}
      <div className={styles.menu} onClick={toggleSidebar}><Menu /></div>

      {/* Desktop logo */}
      <img src="/assets/VFJC.png" alt="VFJC Logo" className={styles.logo} onClick={() => router.push('/HomePage')} />

      {/* Tablet sidebar */}
      <img src="/assets/VFJCsm.png" alt="VFJC Sidebar Logo" className={styles.logoSmall} />

      {/* Separator line */}
      <div className={styles.separator}></div>

      <div className={styles.logos}>
        <div className={`${styles.link} ${pathname === '/HomePage' ? styles.active : ''}`} onClick={() => router.push('/HomePage')}><Home /><span className={styles.linkText}>Home</span></div>
        <div className={`${styles.link} ${pathname === '/DashboardPage' ? styles.active : ''}`} onClick={() => router.push('/DashboardPage')}><LayoutDashboard /><span className={styles.linkText}>Dashboard</span></div>
        <div className={`${styles.link} ${pathname === '/MembersPage' ? styles.active : ''}`} onClick={() => router.push('/MembersPage')}><User /><span className={styles.linkText}>Members</span></div>
        <div className={`${styles.link} ${pathname === '/GroupChatsPage' ? styles.active : ''}`} onClick={() => router.push('/GroupChatsPage')}><Users /><span className={styles.linkText}>Group Chats</span></div>
        <div className={`${styles.link} ${pathname === '/DirectMessagesPage' ? styles.active : ''}`} onClick={() => router.push('/DirectMessagesPage')}><MessageSquare /><span className={styles.linkText}>Direct Messages</span>{hasNewDm && <span className={styles.badge}>●</span>}</div>
        <div className={`${styles.link} ${pathname === '/ReportModal' ? styles.active : ''}`} onClick={() => handleReportClick()}><CircleAlert /><span className={styles.linkText}>Report problem or request feature</span></div>
      </div>

      {showReportModal && (
      <ReportModal
        onClose={() => setShowReportModal(false)}
        handleSubmit={() => {}} // temporary empty function. Change later.
      />
      )}

      <div className={styles.profile} onClick={() => router.push(`/ProfilePage/${profileData.id}`)}>
        <img src={profileData?.profile_image || '/assets/ProfileImage.jpg'}
          alt="Profile"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/assets/ProfileImage.jpg';
          }}
        />
        <span className={styles.profileName}>
          {profileData ? (
            <div>{profileData.full_name}</div>
          ) : (
            <p>loading...</p>
          )}
        </span>
      </div>

      {/* Sidebar navigation modal in mobile */}
      <div className={`${styles.sidebarModal} ${isSidebarOpen ? styles.open : ''}`}>
        <div className={styles.closeIcon} onClick={() => setIsSidebarOpen(false)}>✕</div>

        <div className={styles.modalContent}>
          <img src="/assets/VFJC.png" alt="VFJC Logo" className={styles.logo} onClick={() => router.push('/HomePage')} />
          <div className={styles.separator}></div>

          <div className={styles.logos}>
            <div className={`${styles.link} ${pathname === '/HomePage' ? styles.active : ''}`} onClick={() => router.push('/HomePage')}><Home /><span className={styles.linkText}>Home</span></div>
            <div className={`${styles.link} ${pathname === '/DashboardPage' ? styles.active : ''}`} onClick={() => router.push('/DashboardPage')}><LayoutDashboard /><span className={styles.linkText}>Dashboard</span></div>
            <div className={`${styles.link} ${pathname === '/MembersPage' ? styles.active : ''}`} onClick={() => router.push('/MembersPage')}><User /><span className={styles.linkText}>Members</span></div>
            <div className={`${styles.link} ${pathname === '/GroupChatsPage' ? styles.active : ''}`} onClick={() => router.push('/GroupChatsPage')}><Users /><span className={styles.linkText}>Group Chats</span></div>
            <div className={`${styles.link} ${pathname === '/DirectMessagesPage' ? styles.active : ''}`} onClick={() => router.push('/DirectMessagesPage')}><MessageSquare /><span className={styles.linkText}>Direct Messages</span></div>
            <div className={`${styles.link} ${pathname === '/ReportModal' ? styles.active : ''}`} onClick={() => handleReportClick()}><CircleAlert /><span className={styles.linkText}>Report problem or request feature</span></div>
          </div>
        </div>

        <div className={styles.modalProfile} onClick={() => router.push(`/ProfilePage/${profileData?.id}`)}>
          <img src={profileData?.profile_image || '/assets/ProfileImage.jpg'}
            alt="Profile"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/assets/ProfileImage.jpg';
            }}
          />
          <span className={styles.modalProfileName}>
            {profileData ? (
              <div>{profileData.full_name}</div>
            ) : (
              <p>loading...</p>
            )}
          </span>
        </div>
      </div>
      
    </div>
  );
}
