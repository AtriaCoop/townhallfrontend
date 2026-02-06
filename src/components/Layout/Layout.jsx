import Navigation from "../Navigation/Navigation";
import { useRouter } from "next/router";

const noNavPages = ["/", "/LandingPage", "/SetUpPage"];

function Layout({ children, hasNewDm }) {
  const router = useRouter();
  const showNav = !noNavPages.includes(router.pathname);

  return (
    <>
      {showNav && <Navigation hasNewDm={hasNewDm} />}
      {children}
    </>
  );
}

export default Layout;
