import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/router';
import Icon from '@/icons/Icon';
import styles from './Sidebar.module.scss';

const navItems = [
  { name: 'Dashboard', icon: 'dashboard', path: '/DashboardPage' },
  { name: 'Events', icon: 'calendar', path: '/EventsPage' },
  { name: 'Messages', icon: 'message', path: '/DirectMessagesPage' },
  { name: 'Members', icon: 'members', path: '/MembersPage' },
  { name: 'Group Chats', icon: 'groupChats', path: '/GroupChatsPage' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleNavClick = (path) => {
    router.push(path);
    setIsMobileOpen(false);
  };

  const isActive = (path) => {
    if (path === '/DashboardPage') {
      return pathname === '/DashboardPage' || pathname === '/HomePage';
    }
    return pathname === path || pathname?.startsWith(path + '/');
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className={styles.mobileMenuBtn}
        onClick={() => setIsMobileOpen(true)}
        aria-label="Open navigation menu"
      >
        <Icon name="menu" size={24} />
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className={styles.overlay}
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${isMobileOpen ? styles.mobileOpen : ''}`}>
        {/* Logo Section */}
        <div className={styles.logoSection}>
          <img
            src="/assets/VFJC.png"
            alt="VFJC Logo"
            className={styles.logo}
            onClick={() => handleNavClick('/DashboardPage')}
          />
          <img
            src="/assets/VFJCsm.png"
            alt="VFJC"
            className={styles.logoSmall}
            onClick={() => handleNavClick('/DashboardPage')}
          />

          {/* Mobile Close Button */}
          <button
            className={styles.closeBtn}
            onClick={() => setIsMobileOpen(false)}
            aria-label="Close navigation menu"
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className={styles.nav}>
          {navItems.map((item) => (
            <button
              key={item.name}
              className={`${styles.navItem} ${isActive(item.path) ? styles.active : ''}`}
              onClick={() => handleNavClick(item.path)}
            >
              <span className={styles.navIcon}>
                <Icon name={item.icon} size={22} />
              </span>
              <span className={styles.navLabel}>{item.name}</span>
            </button>
          ))}
        </nav>

        {/* Bottom Section - Atria Watermark */}
        <div className={styles.bottomSection}>
          <div className={styles.atriaWatermark}>
            <img
              src="/assets/atriaLogo.png"
              alt="Powered by Atria"
              className={styles.atriaLogo}
            />
          </div>
        </div>
      </aside>
    </>
  );
}
