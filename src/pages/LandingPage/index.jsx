import { useState, useEffect } from 'react';
import styles from './LandingPage.module.scss';
import { registerUser, getCookie } from '@/utils/authHelpers.jsx';
import { useRouter } from 'next/router';

export default function LandingPage() {

  const router = useRouter();
  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE;

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [message, setMessage] = useState('');
  const [logIn, setLogIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchCSRF() {
      const res = await fetch(`${BASE_URL}/auth/csrf/`, {
        credentials: "include",
      });
      const data = await res.json();
  
      // Store the token manually
      if (data.csrftoken) {
        localStorage.setItem("csrftoken", data.csrftoken);
        console.log("Fetched CSRF from server:", data.csrftoken);
      } else {
        console.warn("CSRF token not found in response.");
      }
    }
  
    fetchCSRF();
  }, []);  

  const handleChange = (e) => {
    setError('');
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // SIGN UP
  const handleSignUp = async () => {
    const result = await registerUser(formData);
  
    if (result.error) {
      setMessage(result.error);
    } else {
      setMessage(result.success);
  
      // 🧠 FIX: Save the created user to localStorage
      localStorage.setItem("user", JSON.stringify(result.data.user));
  
      setTimeout(() => {
        router.push('/SetUpPage');
      }, 1000);
    }
  };

  // SIGN IN
  const handleLogIn = async (event) => {
    event.preventDefault();
    
    const { email, password } = formData;

    try {
        const response = await fetch(`${BASE_URL}/auth/login/`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCookie("csrftoken")
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem("user", JSON.stringify(data.user));  // Store user data
            router.push("/HomePage")

        } else {
            setLoading(false)
            setError(data.error || "Invalid email or password");
        }
    } catch (error) {
        setLoading(false)
        setError("An error occurred while signing in. Please try again.");
    }
};

  return (
    <div className={styles.container}>
      <div className={styles.logoContainer}>
        <img src="/assets/VFJC.png" alt="Vancouver Food Justice Coalition" className={styles.vfjcLogo} />
        <img src="/assets/atria.png" alt="Atria" className={styles.atriaLogo} />
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
