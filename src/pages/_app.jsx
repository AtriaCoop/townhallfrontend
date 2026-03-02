import { useEffect } from "react";
import { useRouter } from "next/router";
import { useDarkMode } from "@/hooks/useDarkMode";
import "@/styles/globals.scss";
import Layout from "@/components/Layout/Layout";
import { PUBLIC_PAGES } from "@/constants/api";
import useNotificationStore from "@/stores/notificationStore";
import { authenticatedFetch } from "@/utils/authHelpers";

export default function App({ Component, pageProps }) {
  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE || "";
  const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_BASE || "ws://127.0.0.1:8000";
  const router = useRouter();

  const [darkMode, setDarkMode] = useDarkMode();

  const addNotification = useNotificationStore((s) => s.addNotification);
  const addUnreadDm = useNotificationStore((s) => s.addUnreadDm);
  const setUnreadCount = useNotificationStore((s) => s.setUnreadCount);
  const setUnreadDmMap = useNotificationStore((s) => s.setUnreadDmMap);
  const setDmPreviews = useNotificationStore((s) => s.setDmPreviews);
  const setHasNewDm = useNotificationStore((s) => s.setHasNewDm);

  // Fetch CSRF token on mount
  useEffect(() => {
    fetch(`${BASE_URL}/auth/csrf/`, {
      method: "GET",
      credentials: "include",
      headers: { Accept: "application/json" },
    }).catch((err) => console.error("CSRF Error:", err));
  }, []);

  // Validate session + enforce profile completion on protected pages
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user || PUBLIC_PAGES.includes(router.pathname)) return;

    fetch(`${BASE_URL}/auth/session/`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) {
          localStorage.removeItem("user");
          router.replace("/");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (!data) return;
        if (!data.user.full_name && router.pathname !== "/SetUpPage") {
          router.replace("/SetUpPage");
        }
      })
      .catch(() => {});
  }, [router.pathname]);

  // Fetch initial unread counts on mount (notifications + DMs)
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user?.id) return;

    authenticatedFetch(`${BASE_URL}/notifications/unread-count/`)
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((data) => {
        if (data) setUnreadCount(data.unread_count);
      })
      .catch(() => {});

    authenticatedFetch(`${BASE_URL}/chats/unread-counts/`)
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((data) => {
        if (!data?.data) return;
        const countMap = {};
        const previewMap = {};
        for (const [chatId, info] of Object.entries(data.data)) {
          countMap[chatId] = info.count;
          previewMap[chatId] = {
            senderId: info.sender_id,
            senderName: info.sender_name,
            senderImage: info.sender_image,
            lastMessage: info.last_message,
            timestamp: info.timestamp,
          };
        }
        setUnreadDmMap(countMap);
        setDmPreviews(previewMap);
        if (Object.keys(countMap).length > 0) setHasNewDm(true);
      })
      .catch(() => {});
  }, []);

  // Global WebSocket connection for user-level events
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user?.id) return;

    const socket = new WebSocket(`${WS_BASE_URL}/ws/users/${user.id}/`);

    socket.onmessage = (e) => {
      const data = JSON.parse(e.data);

      if (data.type === "notification") {
        // Bell icon notification (reaction, comment, event, etc.)
        addNotification(data.notification);
      } else if (data.type === "dm" && data.sender != user.id) {
        // DM message notification with sender preview info
        addUnreadDm(data.chat_id, {
          senderId: data.sender,
          senderName: data.full_name || "Someone",
          senderImage: data.profile_image || null,
          lastMessage: data.message || "",
          timestamp: new Date().toISOString(),
        });
      }
    };

    return () => socket.close();
  }, []);

  return (
    <Layout>
      <Component
        {...pageProps}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />
    </Layout>
  );
}
