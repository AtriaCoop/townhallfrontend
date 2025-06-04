import { useEffect } from 'react';
import '@/styles/globals.scss';

export default function App({ Component, pageProps }) {

  // Load CSRF cookie globally 
  useEffect(() => {
    const BASE_URL = process.env.NEXT_PUBLIC_API_BASE || '';
    fetch(`${BASE_URL}/auth/csrf/`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
      },
    })
      .then(() => console.log('✅ CSRF cookie set globally'))
      .catch((err) => console.error('❌ Failed to set CSRF cookie:', err));
  }, []);

  return <Component {...pageProps} />;
}
