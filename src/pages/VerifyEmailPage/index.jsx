import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { authenticatedFetch } from "@/utils/authHelpers";
import { BASE_URL } from "@/constants/api";
import styles from "./VerifyEmailPage.module.scss";

export default function VerifyEmailPage() {
  const router = useRouter();
  const { uid, token } = router.query;

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  // Get email from localStorage (stored during signup)
  const storedUser = typeof window !== "undefined"
    ? JSON.parse(localStorage.getItem("user") || "null")
    : null;
  const userEmail = storedUser?.email || "";

  // If URL has uid + token, this is a verification link click
  useEffect(() => {
    if (!router.isReady) return;
    if (!uid || !token) return;

    setLoading(true);

    authenticatedFetch(`${BASE_URL}/auth/verify-email/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid, token }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setVerified(true);
          setMessage(data.message);
          // Redirect to login after 3 seconds
          setTimeout(() => router.push("/LandingPage"), 3000);
        }
      })
      .catch(() => {
        setError("Something went wrong. Please try again.");
      })
      .finally(() => setLoading(false));
  }, [router.isReady, uid, token, router]);

  const handleResend = async () => {
    if (!userEmail) {
      setError("No email found. Please sign up again.");
      return;
    }

    setResendLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await authenticatedFetch(
        `${BASE_URL}/auth/resend-verification/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: userEmail }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage("A new verification link has been sent to your email.");
      } else {
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please check your connection.");
    } finally {
      setResendLoading(false);
    }
  };

  // Verification link click mode
  if (uid && token) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            {loading ? (
              <>
                <div className={styles.iconWrapper}>
                  <div className={styles.spinner} />
                </div>
                <h1 className={styles.cardTitle}>Verifying your email...</h1>
                <p className={styles.cardDescription}>
                  Please wait while we confirm your email address.
                </p>
              </>
            ) : verified ? (
              <>
                <div className={styles.iconWrapper}>
                  <svg className={styles.successIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h1 className={styles.cardTitle}>Email verified!</h1>
                <p className={styles.cardDescription}>
                  {message} Redirecting you to sign in...
                </p>
              </>
            ) : (
              <>
                <div className={styles.iconWrapper}>
                  <svg className={styles.errorIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h1 className={styles.cardTitle}>Verification failed</h1>
                <p className={styles.cardDescription}>{error}</p>
              </>
            )}
          </div>

          <p className={styles.backLink}>
            <a href="/LandingPage">Back to Sign In</a>
          </p>
        </div>
      </div>
    );
  }

  // "Check your email" mode (after signup)
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.iconWrapper}>
            <svg className={styles.emailIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          </div>
          <h1 className={styles.cardTitle}>Check your email</h1>
          <p className={styles.cardDescription}>
            We&apos;ve sent a verification link to{" "}
            {userEmail ? <strong>{userEmail}</strong> : "your email"}. Please
            click the link to verify your account.
          </p>
        </div>

        <div className={styles.instructions}>
          <p>Didn&apos;t receive the email?</p>
          <ul>
            <li>Check your spam or junk folder</li>
            <li>Make sure you entered the correct email</li>
          </ul>
        </div>

        <button
          type="button"
          className={styles.submitButton}
          onClick={handleResend}
          disabled={resendLoading}
        >
          {resendLoading ? "Sending..." : "Resend verification email"}
        </button>

        {message && <p className={styles.message}>{message}</p>}
        {error && <p className={styles.error}>{error}</p>}

        <p className={styles.backLink}>
          <a href="/LandingPage">Back to Sign In</a>
        </p>
      </div>
    </div>
  );
}
