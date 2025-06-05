import { useState, useEffect } from 'react';
import styles from './LandingPage.module.scss';
import { registerUser, getCookie } from '@/utils/authHelpers';
import { useRouter } from 'next/router';

export default function LandingPage() {
  const router = useRouter();
  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE || '';
  console.log("BASE_URL:", BASE_URL);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [message, setMessage] = useState('');
  const [logIn, setLogIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setError('');
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSignUp = async () => {
    const result = await registerUser(formData);

    if (result.error) {
      setMessage(result.error);
    } else {
      setMessage(result.success);
      localStorage.setItem("user", JSON.stringify(result.data.user));
      setTimeout(() => {
        router.push('/SetUpPage');
      }, 1000);
    }
  };

const handleLogIn = async (event) => {
  event.preventDefault();
  const { email, password } = formData;

  try {
    // 🧠 STEP 1: Fetch CSRF token directly from JSON
    const csrfRes = await fetch(`${BASE_URL}/auth/csrf/`, {
      method: "GET",
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
    });

    const csrfData = await csrfRes.json();
    const csrfToken = csrfData.csrfToken || getCookie("csrftoken");

    console.log("Logging in with CSRF:", csrfToken);

    // 🧠 STEP 2: Send login request with CSRF token
    const response = await fetch(`${BASE_URL}/auth/login/`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken,
      },
      body: JSON.stringify({ email, password }),
    });

    const contentType = response.headers.get("content-type");
    if (!contentType.includes("application/json")) {
      const text = await response.text();
      console.error("Non-JSON response:", text); // prevent crash on HTML error
      setError("Unexpected server error.");
      return;
    }

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem("user", JSON.stringify(data.user));
      router.push("/HomePage");
    } else {
      setError(data.error || "Invalid email or password");
    }
  } catch (err) {
    setError("Login failed.");
    console.error("Login error:", err);
  }
};

  return (
    <div className={styles.container}>
      <div className={styles.logoContainer}>
        <img src="/assets/VFJC.png" alt="Vancouver Food Justice Coalition" className={styles.vfjcLogo} />
        <img src="/assets/atriaLogo.png" alt="Atria" className={styles.atriaLogo} />
      </div>

      <div className={styles.card}>
        <h1>{logIn ? 'Welcome Back!' : 'Welcome to Atria, the platform for coalition collaboration.'}</h1>
        <p>{logIn ? 'Log Into Your Account' : 'This tool will help the Vancouver Food Justice Coalition communicate, stay organized, and accomplish more together.'}</p>

        <label>Email</label>
        <input
          type="email"
          name="email"
          placeholder="Enter email..."
          onChange={handleChange}
        />

        <label>Password</label>
        <input
          type="password"
          name="password"
          placeholder="Enter password..."
          onChange={handleChange}
        />

        <button className={styles.signupButton} onClick={logIn ? handleLogIn : handleSignUp}>
          {logIn ? 'LOGIN' : 'SIGN UP'}
        </button>

        {logIn && (
          <p className={styles.forgotPassword}>
            <a href="#">FORGOT YOUR PASSWORD?</a>
          </p>
        )}

        {message && <p className={styles.message}>{message}</p>}
        {logIn && error && <p className={styles.error}>{error}</p>}

        <p className={styles.loginText}>
          {logIn ? (
            <>
              Don't Have An Account?{' '}
              <span onClick={() => { setLogIn(false); setError(''); setMessage(''); }} style={{ cursor : 'pointer' }}>
                SIGN UP
              </span>
            </>
          ) : (
            <>
              Already Have An Account?{' '}
              <span onClick={() => { setLogIn(true); setError(''); setMessage(''); }} style={{ cursor : 'pointer' }}>
                LOG IN
              </span>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
