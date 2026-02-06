import { useRouter } from "next/router";
import Sidebar from "../Sidebar/Sidebar";
import Header from "../Header/Header";
import styles from "./Layout.module.scss";

const noNavPages = ["/", "/LandingPage", "/SetUpPage"];

function Layout({ children, hasNewDm }) {
  const router = useRouter();
  const showNav = !noNavPages.includes(router.pathname);

  if (!showNav) {
    return <>{children}</>;
  }

  return (
    <div className={styles.layout}>
      <Sidebar />
      <div className={styles.mainArea}>
        <Header hasNewDm={hasNewDm} />
        <main className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;
