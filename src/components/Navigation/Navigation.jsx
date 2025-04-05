import styles from './Navigation.module.scss';
import { Menu, User, Users, MessageSquare, Home } from 'lucide-react';

export default function Navigation() {
  return (
    <div className={styles.nav}>
      <div className={styles.menu}><Menu /></div>

      <img src="/assets/VFJC.png" alt="VFJC Logo" className={styles.logo} />
      <img src="/assets/VFJCsm.png" alt="VFJC Sidebar Logo" className={styles.logoSidebar} />

      <div className={styles.menuIcons}>
        <Home />
        <User />
        <Users />
        <MessageSquare />
      </div>
    </div>
  );
}
