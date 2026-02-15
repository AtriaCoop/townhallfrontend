import { useEffect, useState } from "react";
import { useDarkMode } from "@/hooks/useDarkMode";
import "@/styles/globals.scss";
import Layout from "@/components/Layout/Layout";

export default function App({ Component, pageProps }) {
  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE || "";
  const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_BASE || "ws://127.0.0.1:8000";

  const [hasNewDm, setHasNewDm] = useState(false);
  const [unreadMap, setUnreadMap] = useState({});
  const [darkMode, setDarkMode] = useDarkMode();

  useEffect(() => {
    fetch(`${BASE_URL}/auth/csrf/`, {
      method: "GET",
      credentials: "include",
      headers: { Accept: "application/json" },
    }).catch((err) => console.error("CSRF Error:", err));
  }, []);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user?.id) return;

    const socket = new WebSocket(`${WS_BASE_URL}/ws/users/${user.id}/`);

    socket.onmessage = (e) => {
      const { chat_id, sender } = JSON.parse(e.data);

      if (sender !== user.id) {
        setHasNewDm(true);
        setUnreadMap((prev) => ({
          ...prev,
          [chat_id]: (prev[chat_id] || 0) + 1,
        }));
      }
    };

    return () => socket.close();
  }, []);

  return (
    <Layout hasNewDm={hasNewDm}>
      <Component
        {...pageProps}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        hasNewDm={hasNewDm}
        setHasNewDm={setHasNewDm}
        unreadMap={unreadMap}
        setUnreadMap={setUnreadMap}
      />
    </Layout>
  );
}
