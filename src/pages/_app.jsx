import { useEffect, useState } from 'react';
import '@/styles/globals.scss';

export default function App({ Component, pageProps }) {
  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE || '';
  const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_BASE || 'ws://127.0.0.1:8000';

  const [hasNewDm, setHasNewDm] = useState(false);
  const [unreadMap, setUnreadMap] = useState({});

  // Fetch CSRF token on load
  useEffect(() => {
    fetch(`${BASE_URL}/auth/csrf/`, {
      method: 'GET',
      credentials: 'include',
      headers: { Accept: 'application/json' },
    }).catch((err) => console.error('CSRF Error:', err));
  }, []);

  // Hydrate unreadMap from localStorage when app loads
  useEffect(() => {
    const storedMap = JSON.parse(localStorage.getItem('unreadMap') || '{}');
    setUnreadMap(storedMap);

    const anyUnread = Object.values(storedMap).some(count => count > 0);
    setHasNewDm(anyUnread);
  }, []);

  // Persist unreadMap to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('unreadMap', JSON.stringify(unreadMap));

    const anyUnread = Object.values(unreadMap).some(count => count > 0);
    setHasNewDm(anyUnread);
  }, [unreadMap]);

  // Listen for incoming DMs via WebSocket
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || '{}');
    if (!user?.id) return;

    const socket = new WebSocket(`${WS_BASE_URL}/ws/users/${user.id}/`);

    socket.onmessage = (e) => {
      const { chat_id, sender } = JSON.parse(e.data);

      if (sender !== user.id) {
        setUnreadMap(prev => ({
          ...prev,
          [chat_id]: (prev[chat_id] || 0) + 1,
        }));
      }
    };

    return () => socket.close();
  }, []);

  return (
    <Component
      {...pageProps}
      hasNewDm={hasNewDm}
      setHasNewDm={setHasNewDm}
      unreadMap={unreadMap}
      setUnreadMap={setUnreadMap}
    />
  );
}
