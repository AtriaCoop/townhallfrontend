import { useState, useEffect } from 'react';
import styles from './LandingPage.module.scss';
import { registerUser, getCookie, authenticatedFetch } from '@/utils/authHelpers';
import { useRouter } from 'next/router';
import Loader from '@/components/Loader/Loader';
import PrivacyModal from '@/components/PrivacyModal/PrivacyModal'; // NEW MODIFICATIONS

export default function LandingPage() {
  const router = useRouter();
  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE || '';

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const [logIn, setLogIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPrivacyModal, setShowPrivacyModal] = useState(false); // NEW MODIFICATIONS


  // Logo animation
  const [visibleLogos, setVisibleLogos] = useState([]);
  const [showAuthUI, setShowAuthUI] = useState(false);

  useEffect(() => {
    const logoSequence = [
      { src: "/assets/redLogo.png", delay: 500 },
      { src: "/assets/yellowLogo.png", delay: 1250 },
      { src: "/assets/blueLogo.png", delay: 2000 },
    ];

    logoSequence.forEach((logo) => {
      setTimeout(() => {
        setVisibleLogos((prev) => [...prev, logo.src]);
      }, logo.delay);
    });

    const timeout = setTimeout(() => {
      setShowAuthUI(true);
    }, 3000);

    return () => clearTimeout(timeout);
  }, []);

  const handleChange = (e) => {
    setError('');
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSignUp = async () => {
    setLoading(true);
    const result = await registerUser(formData);
    if (result.error) {
      setMessage(result.error);
      setLoading(false);
    } else {
      setMessage(result.success);
      localStorage.setItem("user", JSON.stringify(result.data.user));
      setTimeout(() => router.push('/SetUpPage'), 1000);
    }
  };

  const handleLogIn = async (event) => {
    event.preventDefault();
    const { email, password } = formData;
    if(email == "" || password == "") {
      setMessage("Please fill in all fields.");
      return;
    }
    setLoading(true);

    try {
      const response = await authenticatedFetch(`${BASE_URL}/auth/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const contentType = response.headers.get("content-type");
      if (!contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Non-JSON response:", text);
        setError("Unexpected server error.");
        return;
      }

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("user", JSON.stringify(data.user));
        router.push("/HomePage");
      } else {
        setLoading(false);
        setError(data.error || "Invalid email or password");
      }
    } catch (err) {
      setError("Login failed.");
      setLoading(false);
      console.error("Login error:", err);
    }
  };

  useEffect(() => {
    if (!router.isReady) return;
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) router.push("/HomePage");
  }, [router.isReady]);

  return (
    <div className={styles.container}>
      {!showAuthUI ? (
        <div className={styles.logoSequence}>
          <div className={styles.logoCluster}>
            {visibleLogos.includes("/assets/redLogo.png") && (
              <img src="/assets/redLogo.png" className={styles.redLogo} alt="Red" />
            )}
            {visibleLogos.includes("/assets/yellowLogo.png") && (
              <img src="/assets/yellowLogo.png" className={styles.yellowLogo} alt="Yellow" />
            )}
            {visibleLogos.includes("/assets/blueLogo.png") && (
              <img src="/assets/blueLogo.png" className={styles.blueLogo} alt="Blue" />
            )}
          </div>
        </div>
      ) : loading ? (
        <Loader />
      ) : (
        <>
          <div className={styles.logoContainer}>
            <img src="/assets/VFJC.png" alt="Vancouver Food Justice Coalition" className={styles.vfjcLogo} />
            <img src="/assets/atriaLogo.png" alt="Atria" className={styles.atriaLogo} />
          </div>

          <div className={styles.card}>
            <h1>{logIn ? 'Welcome Back!' : 'Welcome to Atria, the platform for coalition collaboration.'}</h1>
            <p>{logIn ? 'Log Into Your Account' : 'This tool will help the Vancouver Food Justice Coalition communicate, stay organized, and accomplish more together.'}</p>

            <label>Email</label>
            <input type="email" name="email" placeholder="Enter email..." onChange={handleChange} />

            <label>Password</label>
            <input type="password" name="password" placeholder="Enter password..." onChange={handleChange} />

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
                <>Don't Have An Account? <span onClick={() => { setLogIn(false); setError(''); setMessage(''); }}>SIGN UP</span></>
              ) : (
                <>Already Have An Account? <span onClick={() => { setLogIn(true); setError(''); setMessage(''); }}>LOG IN</span></>
              )}
            </p>

            {/* New modifications */}
            <p className={styles.privacyText}>
              By signing up or logging in, you agree to our{' '}
              <span onClick={() => setShowPrivacyModal(true)}>Privacy Notice</span>
            </p>

            {/* Privacy Modal */}
            {showPrivacyModal && (
              <PrivacyModal onClose={() => setShowPrivacyModal(false)} />
            )}
          </div>
        </>
      )}
    </div>
  );
}
