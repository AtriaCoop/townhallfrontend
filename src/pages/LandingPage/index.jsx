import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import styles from "./LandingPage.module.scss";
import { registerUser, authenticatedFetch } from "@/utils/authHelpers";
import { getStoredUser } from "@/utils/getStoredUser";
import { BASE_URL } from "@/constants/api";
import Loader from "@/components/Loader/Loader";
import PrivacyModal from '@/components/PrivacyModal/PrivacyModal';
import Icon from "@/icons/Icon";

const AUTH_MODES = {
  LOGIN: "login",
  SIGNUP: "signup",
};

// Helper functions
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function calculatePasswordStrength(password) {
  if (password.length === 0) return "";
  if (password.length < 6) return "weak";
  if (password.length < 10) return "medium";
  if (password.length >= 10 && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
    return "strong";
  }
  return "medium";
}

export default function LandingPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [authMode, setAuthMode] = useState(AUTH_MODES.SIGNUP);
  const [loading, setLoading] = useState(false);
  const [deactivated, setDeactivated] = useState(false);
  const [reactivating, setReactivating] = useState(false);

  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  // UX Enhancements
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState("");

  const isLoginMode = authMode === AUTH_MODES.LOGIN;

  // Check for existing user session — validate with server before redirecting
  useEffect(() => {
    if (!router.isReady) return;
    const storedUser = getStoredUser();
    if (!storedUser) return;

    fetch(`${BASE_URL}/auth/session/`, { credentials: "include" })
      .then((res) => {
        if (res.ok) {
          router.push("/HomePage");
        } else {
          localStorage.removeItem("user");
        }
      })
      .catch(() => {});
  }, [router.isReady, router]);

  const clearMessages = useCallback(() => {
    setError("");
    setMessage("");
    setDeactivated(false);
  }, []);

  const handleChange = useCallback(
    (e) => {
      clearMessages();
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));

      // Real-time email validation
      if (name === "email") {
        if (value && !validateEmail(value)) {
          setEmailError("Please enter a valid email address");
        } else {
          setEmailError("");
        }
      }

      // Real-time password strength
      if (name === "password" && !isLoginMode) {
        setPasswordStrength(calculatePasswordStrength(value));
      }
    },
    [clearMessages, isLoginMode]
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
      // TODO: Re-enable email verification redirect once a proper sending domain is configured
      // setMessage("Account created! Please check your email to verify.");
      // setTimeout(() => router.push("/VerifyEmailPage"), 1500);
      setMessage("Account created! You can now sign in.");
      setLoading(false);
      setTimeout(() => setAuthMode(AUTH_MODES.LOGIN), 1500);
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
          // Redirect based on profile completion
          if (!data.user.full_name) {
            router.push("/SetUpPage");
          } else {
            router.push("/HomePage");
          }
        } else {
          setLoading(false);
          if (data.error === "account_deactivated") {
            setDeactivated(true);
            setError("");
          } else {
            setError(data.error || "Invalid email or password");
          }
        }
      } catch (err) {
        setError("Login failed. Please check your connection and try again.");
        setLoading(false);
        console.error("Login error:", err);
      }
    },
    [formData, BASE_URL, router]
  );

  const handleReactivate = useCallback(async () => {
    setReactivating(true);
    setError("");

    try {
      const res = await authenticatedFetch(`${BASE_URL}/auth/reactivate/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setDeactivated(false);
        setMessage("Account reactivated! Signing you in...");
        // Auto-login after reactivation
        setTimeout(() => {
          handleLogIn({ preventDefault: () => {} });
        }, 1000);
      } else {
        setError(data.error || "Failed to reactivate account.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setReactivating(false);
    }
  }, [formData, BASE_URL, handleLogIn]);

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
    setEmailError("");
    setPasswordStrength("");
    setShowPassword(false);
  }, [clearMessages]);

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
      {/* Left Side - Brand Section */}
      <div className={styles.brandSection}>
        <div className={styles.brandContent}>
          <img
            src="/assets/atriaLogo.png"
            alt="Atria"
            className={styles.atriaLogo}
          />
          <div className={styles.brandDivider} />
          <img
            src="/assets/VFJC.png"
            alt="Vancouver Food Justice Coalition"
            className={styles.vfjcLogo}
          />
        </div>
      </div>

      {/* Right Side - Auth Section */}
      <div className={styles.authSection}>
        <div className={styles.authContent}>
          <div className={styles.authHeader}>
            <h1 className={styles.authTitle}>
              {isLoginMode ? "Welcome back" : "Get started"}
            </h1>
            <p className={styles.authDescription}>
              {isLoginMode
                ? "Sign in to your account to continue."
                : "Create your account to continue."}
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
                className={`${styles.input} ${emailError ? styles.inputError : ''}`}
                autoComplete="email"
              />
              {emailError && (
                <span className={styles.fieldError}>{emailError}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password" className={styles.label}>
                Password
              </label>
              <div className={styles.passwordWrapper}>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  className={styles.input}
                  autoComplete={
                    isLoginMode ? "current-password" : "new-password"
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={styles.passwordToggle}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <Icon name={showPassword ? "eyeOff" : "eye"} size={20} />
                </button>
              </div>
              {!isLoginMode && passwordStrength && (
                <div className={styles.passwordStrength}>
                  <div className={styles.strengthBar}>
                    <div
                      className={`${styles.strengthFill} ${styles[`strength${passwordStrength.charAt(0).toUpperCase() + passwordStrength.slice(1)}`]}`}
                    />
                  </div>
                  <span className={`${styles.strengthText} ${styles[`text${passwordStrength.charAt(0).toUpperCase() + passwordStrength.slice(1)}`]}`}>
                    {passwordStrength.charAt(0).toUpperCase() + passwordStrength.slice(1)} password
                  </span>
                </div>
              )}
            </div>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading || (emailError && formData.email)}
            >
              {loading ? (
                <span className={styles.buttonLoading}>
                  <svg className={styles.spinner} viewBox="0 0 24 24">
                    <circle
                      className={styles.spinnerCircle}
                      cx="12"
                      cy="12"
                      r="10"
                      fill="none"
                      strokeWidth="3"
                    />
                  </svg>
                  {isLoginMode ? "Signing in..." : "Creating account..."}
                </span>
              ) : (
                isLoginMode ? "Sign in" : "Create account"
              )}
            </button>

            {isLoginMode && (
              <p className={styles.forgotPassword}>
                <a href="/ForgotPasswordPage">Forgot your password?</a>
              </p>
            )}
          </form>

          {message && <p className={styles.message}>{message}</p>}
          {error && <p className={styles.error}>{error}</p>}

          {deactivated && (
            <div className={styles.deactivatedNotice}>
              <p className={styles.deactivatedMessage}>
                Your account has been deactivated. Would you like to reactivate it?
              </p>
              <button
                type="button"
                className={styles.reactivateButton}
                onClick={handleReactivate}
                disabled={reactivating}
              >
                {reactivating ? "Reactivating..." : "Reactivate Account"}
              </button>
            </div>
          )}

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

      {showPrivacyModal && (
        <PrivacyModal onClose={() => setShowPrivacyModal(false)} />
      )}
    </div>
  );
}
