import { useState } from 'react';
import styles from './LandingPage.module.scss';
import { registerUser } from '@/utils/authHelpers';
import { useRouter } from 'next/router';

export default function LandingPage() {

  const router = useRouter();

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

  // SIGN UP
  const handleSignUp = async () => {
    const result = await registerUser(formData);
    if (result.error) {
      setMessage(result.error);
    } else {
      setMessage(result.success);
    }
  };

  // SIGN IN
  const handleSignIn = async (event) => {
    event.preventDefault();
    
    const { email, password } = formData;

    try {
        const response = await fetch("http://127.0.0.1:8000/auth/login/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
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

        <button className={styles.signupButton} onClick={logIn ? handleSignIn : handleSignUp}>
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
