import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import styles from "./LandingPage.module.scss";
import { registerUser, authenticatedFetch } from "@/utils/authHelpers";
import Loader from "@/components/Loader/Loader";
import PrivacyModal from '@/components/PrivacyModal/PrivacyModal';

const AUTH_MODES = {
  LOGIN: "login",
  SIGNUP: "signup",
};

export default function LandingPage() {
  const router = useRouter();
  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE || "";

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [authMode, setAuthMode] = useState(AUTH_MODES.SIGNUP);
  const [loading, setLoading] = useState(false);

  // Logo animation state
  const [visibleLogos, setVisibleLogos] = useState([]);
  const [showAuthUI, setShowAuthUI] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const isLoginMode = authMode === AUTH_MODES.LOGIN;

  // Logo sequence animation
  useEffect(() => {
    const logoSequence = [
      { src: "/assets/redLogo.png", delay: 500 },
      { src: "/assets/yellowLogo.png", delay: 1250 },
      { src: "/assets/blueLogo.png", delay: 2000 },
    ];

    const timeouts = logoSequence.map((logo) =>
      setTimeout(() => {
        setVisibleLogos((prev) => [...prev, logo.src]);
      }, logo.delay)
    );

    const showUITimeout = setTimeout(() => {
      setShowAuthUI(true);
    }, 3000);

    return () => {
      timeouts.forEach(clearTimeout);
      clearTimeout(showUITimeout);
    };
  }, []);

  // Check for existing user session
  useEffect(() => {
    if (!router.isReady) return;
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      router.push("/HomePage");
    }
  }, [router.isReady, router]);

  const clearMessages = useCallback(() => {
    setError("");
    setMessage("");
  }, []);

  const handleChange = useCallback(
    (e) => {
      clearMessages();
      setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    },
    [clearMessages]
  );

  const handleSignUp = useCallback(async () => {
    if (!formData.email || !formData.password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    const result = await registerUser(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setMessage(result.success);
      localStorage.setItem("user", JSON.stringify(result.data.user));
      setTimeout(() => router.push("/SetUpPage"), 1000);
    }
  }, [formData, router]);

  const handleLogIn = useCallback(
    async (event) => {
      event.preventDefault();
      const { email, password } = formData;

      if (!email || !password) {
        setError("Please fill in all fields.");
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
        if (!contentType?.includes("application/json")) {
          setError("Unexpected server error. Please try again.");
          setLoading(false);
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
        setError("Login failed. Please check your connection and try again.");
        setLoading(false);
        console.error("Login error:", err);
      }
    },
    [formData, BASE_URL, router]
  );

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (isLoginMode) {
        handleLogIn(e);
      } else {
        handleSignUp();
      }
    },
    [isLoginMode, handleLogIn, handleSignUp]
  );

  const toggleAuthMode = useCallback(() => {
    setAuthMode((prev) =>
      prev === AUTH_MODES.LOGIN ? AUTH_MODES.SIGNUP : AUTH_MODES.LOGIN
    );
    clearMessages();
  }, [clearMessages]);

  // Render logo sequence animation
  if (!showAuthUI) {
    return (
      <div className={styles.container}>
        <div className={styles.logoSequence}>
          <div className={styles.logoCluster}>
            {visibleLogos.includes("/assets/redLogo.png") && (
              <img
                src="/assets/redLogo.png"
                className={styles.redLogo}
                alt="Red logo"
              />
            )}
            {visibleLogos.includes("/assets/yellowLogo.png") && (
              <img
                src="/assets/yellowLogo.png"
                className={styles.yellowLogo}
                alt="Yellow logo"
              />
            )}
            {visibleLogos.includes("/assets/blueLogo.png") && (
              <img
                src="/assets/blueLogo.png"
                className={styles.blueLogo}
                alt="Blue logo"
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  // Render loading state
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingOverlay}>
          <Loader
            text={
              isLoginMode ? "Signing you in..." : "Creating your account..."
            }
          />
        </div>
      </div>
    );
  }

  // Render auth form
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.brandingPanel}>
          <img
            src="/assets/VFJC.png"
            alt="Vancouver Food Justice Coalition"
            className={styles.vfjcLogo}
          />
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h1 className={styles.cardTitle}>
              {isLoginMode ? "Welcome back" : "Get started"}
            </h1>
            <p className={styles.cardDescription}>
              {isLoginMode
                ? "Sign in to your account to continue."
                : "Create your account to join the coalition."}
            </p>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.label}>
                Email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                className={styles.input}
                autoComplete="email"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password" className={styles.label}>
                Password
              </label>
              <input
                id="password"
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                className={styles.input}
                autoComplete={
                  isLoginMode ? "current-password" : "new-password"
                }
              />
            </div>

            <button type="submit" className={styles.submitButton}>
              {isLoginMode ? "Sign in" : "Create account"}
            </button>

            {isLoginMode && (
              <p className={styles.forgotPassword}>
                <a href="/ForgotPasswordPage">Forgot your password?</a>
              </p>
            )}
          </form>

          {message && <p className={styles.message}>{message}</p>}
          {error && <p className={styles.error}>{error}</p>}

          <p className={styles.switchMode}>
            {isLoginMode
              ? "Don\u2019t have an account? "
              : "Already have an account? "}
            <span onClick={toggleAuthMode} className={styles.switchModeLink}>
              {isLoginMode ? "Sign up" : "Sign in"}
            </span>
          </p>
          <p className={styles.privacyText}>
            By {isLoginMode ? 'signing in' : 'creating an account'}, you agree to our{' '}
            <span onClick={() => setShowPrivacyModal(true)} className={styles.privacyLink}>
              Privacy Notice
            </span>
          </p>
        </div>
      </div>

        {/* Privacy Modal */}
        {showPrivacyModal && (
        <PrivacyModal onClose={() => setShowPrivacyModal(false)} />
      )}

      <img
        src="/assets/atriaLogo.png"
        alt="Atria"
        className={styles.atriaLogo}
      />
    </div>
  );
}
