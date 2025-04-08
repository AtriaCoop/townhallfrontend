import styles from './Navigation.module.scss';
import { Menu, User, Users, MessageSquare, Home } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/router';

export default function Navigation() {

  const pathname = usePathname();
  const router = useRouter();
  
  return (
    <div className={styles.nav}>

      {/* Mobile burger menu */}
      <div className={styles.menu}><Menu /></div>

      {/* Desktop logo */}
      <img src="/assets/VFJC.png" alt="VFJC Logo" className={styles.logo} />

      {/* Tablet sidebar */}
      <img src="/assets/VFJCsm.png" alt="VFJC Sidebar Logo" className={styles.logoSmall} />

      {/* Separator line */}
      <div className={styles.separator}></div>

      <div className={styles.logos}>
        <div className={`${styles.link} ${pathname === '/HomePage' ? styles.active : ''}`} onClick={() => router.push('/HomePage')}><Home /><span className={styles.linkText}>Home</span></div>
        <div className={`${styles.link} ${pathname === '/MembersPage' ? styles.active : ''}`} onClick={() => router.push('/MembersPage')}><User /><span className={styles.linkText}>Members</span></div>
        <div className={`${styles.link} ${pathname === '/GroupChatsPage' ? styles.active : ''}`} onClick={() => router.push('/GroupChatsPage')}><Users /><span className={styles.linkText}>Group Chats</span></div>
        <div className={`${styles.link} ${pathname === '/DirectMessagesPage' ? styles.active : ''}`} onClick={() => router.push('/DirectMessagesPage')}><MessageSquare /><span className={styles.linkText}>Direct Messages</span></div>
      </div>

      <div className={styles.profile}>
        <img src="/assets/VFJC.png" alt="Profile" />
        <span className={styles.profileName}>Ryan Yee</span>
      </div>
    </div>
  );
}
