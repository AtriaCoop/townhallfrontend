import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Icon from "@/icons/Icon";
import { authenticatedFetch } from "@/utils/authHelpers";
import { getStoredUser } from "@/utils/getStoredUser";
import styles from "./SettingsPage.module.scss";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE || "";

export default function SettingsPage({ darkMode, setDarkMode }) {
  const router = useRouter();

  // Privacy settings state
  const [privacy, setPrivacy] = useState({
    show_email: true,
    show_in_directory: true,
    allow_dms: true,
  });
  const [privacyLoaded, setPrivacyLoaded] = useState(false);

  // Change password state
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [passwordError, setPasswordError] = useState("");

  // Toast state
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);

  // Modal state
  const [activeModal, setActiveModal] = useState(null); // "changePassword" | "deactivate" | "delete" | null
  const [isProcessing, setIsProcessing] = useState(false);
  const [verificationInput, setVerificationInput] = useState("");

  // Fetch user privacy settings on mount
  useEffect(() => {
    async function fetchSettings() {
      const user = getStoredUser();
      if (!user?.id) return;

      try {
        const res = await authenticatedFetch(`${BASE_URL}/user/${user.id}/`);
        const data = await res.json();
        if (data.user) {
          setPrivacy({
            show_email: data.user.show_email ?? true,
            show_in_directory: data.user.show_in_directory ?? true,
            allow_dms: data.user.allow_dms ?? true,
          });
        }
      } catch (err) {
        console.error("Error fetching settings:", err);
      } finally {
        setPrivacyLoaded(true);
      }
    }
    fetchSettings();
  }, []);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 4000);
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, [toast]);

  function showToast(type, message) {
    setToast({ type, message });
  }

  // --- Privacy toggle handler ---
  async function handlePrivacyToggle(field) {
    const user = getStoredUser();
    if (!user?.id) return;

    const newValue = !privacy[field];
    setPrivacy((prev) => ({ ...prev, [field]: newValue }));

    try {
      const res = await authenticatedFetch(`${BASE_URL}/user/${user.id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: newValue }),
      });

      if (!res.ok) {
        // Revert on failure
        setPrivacy((prev) => ({ ...prev, [field]: !newValue }));
        showToast("error", "Failed to update setting.");
      }
    } catch {
      setPrivacy((prev) => ({ ...prev, [field]: !newValue }));
      showToast("error", "Failed to update setting.");
    }
  }

  // --- Change password handler ---
  async function handleChangePassword(e) {
    e.preventDefault();
    setPasswordError("");

    const { current_password, new_password, confirm_password } = passwordForm;

    if (!current_password || !new_password || !confirm_password) {
      setPasswordError("All fields are required.");
      return;
    }

    if (new_password !== confirm_password) {
      setPasswordError("New passwords do not match.");
      return;
    }

    if (new_password.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      return;
    }

    try {
      const res = await authenticatedFetch(`${BASE_URL}/auth/change-password/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current_password, new_password }),
      });

      const data = await res.json();

      if (res.ok) {
        showToast("success", "Password changed successfully.");
        setPasswordForm({ current_password: "", new_password: "", confirm_password: "" });
        setActiveModal(null);
      } else {
        setPasswordError(data.error || "Failed to change password.");
      }
    } catch {
      setPasswordError("Something went wrong. Please try again.");
    }
  }

  // --- Logout handler ---
  async function handleLogout() {
    try {
      await authenticatedFetch(`${BASE_URL}/auth/logout/`, { method: "POST" });
    } catch (error) {
      console.error("Logout error:", error);
    }
    localStorage.removeItem("user");
    router.push("/");
  }

  // --- Deactivate account handler ---
  async function handleDeactivate() {
    setIsProcessing(true);
    try {
      const res = await authenticatedFetch(`${BASE_URL}/auth/deactivate/`, {
        method: "POST",
      });

      if (res.ok) {
        localStorage.clear();
        sessionStorage.clear();
        router.push("/");
      } else {
        const data = await res.json().catch(() => ({}));
        showToast("error", data.error || "Failed to deactivate account.");
        setActiveModal(null);
        setVerificationInput("");
      }
    } catch {
      showToast("error", "Failed to deactivate account.");
      setActiveModal(null);
      setVerificationInput("");
    } finally {
      setIsProcessing(false);
    }
  }

  // --- Delete account handler ---
  async function handleDelete() {
    const user = getStoredUser();
    if (!user?.id) return;

    setIsProcessing(true);
    try {
      const res = await authenticatedFetch(`${BASE_URL}/user/${user.id}/`, {
        method: "DELETE",
      });

      if (res.ok) {
        localStorage.clear();
        sessionStorage.clear();
        router.push("/");
      } else {
        const data = await res.json().catch(() => ({}));
        showToast("error", data.message || "Failed to delete account.");
        setActiveModal(null);
        setVerificationInput("");
      }
    } catch {
      showToast("error", "Failed to delete account.");
      setActiveModal(null);
      setVerificationInput("");
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className={styles.settingsPage}>
      {/* Toast */}
      {toast && (
        <div
          className={`${styles.toast} ${
            toast.type === "success" ? styles.toastSuccess : styles.toastError
          }`}
          role="status"
          aria-live="assertive"
        >
          {toast.message}
        </div>
      )}

      <h1 className={styles.pageTitle}>Settings</h1>

      {/* ===== Appearance ===== */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Appearance</h2>
        <p className={styles.cardDescription}>
          Customize how TownHall looks for you.
        </p>

        <div className={styles.themeOptions}>
          <button
            className={`${styles.themeOption} ${!darkMode ? styles.themeActive : ""}`}
            onClick={() => setDarkMode(false)}
          >
            <div className={styles.themePreview}>
              <div className={styles.themePreviewLight}>
                <div className={styles.previewBar} />
                <div className={styles.previewLine} />
                <div className={styles.previewLineShort} />
              </div>
            </div>
            <div className={styles.themeInfo}>
              <Icon name="sun" size={18} />
              <span>Light</span>
            </div>
          </button>

          <button
            className={`${styles.themeOption} ${darkMode ? styles.themeActive : ""}`}
            onClick={() => setDarkMode(true)}
          >
            <div className={styles.themePreview}>
              <div className={styles.themePreviewDark}>
                <div className={styles.previewBar} />
                <div className={styles.previewLine} />
                <div className={styles.previewLineShort} />
              </div>
            </div>
            <div className={styles.themeInfo}>
              <Icon name="moon" size={18} />
              <span>Dark</span>
            </div>
          </button>
        </div>
      </div>

      {/* ===== Privacy & Visibility ===== */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Privacy & Visibility</h2>
        <p className={styles.cardDescription}>
          Control who can see your information and contact you.
        </p>

        {privacyLoaded && (
          <div className={styles.settingsList}>
            <div className={styles.toggleRow}>
              <div className={styles.toggleInfo}>
                <span className={styles.toggleLabel}>Show email on profile</span>
                <span className={styles.toggleDescription}>
                  Other members can see your email address on your profile page.
                </span>
              </div>
              <button
                className={`${styles.toggleSwitch} ${privacy.show_email ? styles.toggleActive : ""}`}
                onClick={() => handlePrivacyToggle("show_email")}
                role="switch"
                aria-checked={privacy.show_email}
              >
                <span className={styles.toggleSlider} />
              </button>
            </div>

            <div className={styles.toggleRow}>
              <div className={styles.toggleInfo}>
                <span className={styles.toggleLabel}>Show in member directory</span>
                <span className={styles.toggleDescription}>
                  Your profile appears in the Members page for others to find.
                </span>
              </div>
              <button
                className={`${styles.toggleSwitch} ${privacy.show_in_directory ? styles.toggleActive : ""}`}
                onClick={() => handlePrivacyToggle("show_in_directory")}
                role="switch"
                aria-checked={privacy.show_in_directory}
              >
                <span className={styles.toggleSlider} />
              </button>
            </div>

            <div className={styles.toggleRow}>
              <div className={styles.toggleInfo}>
                <span className={styles.toggleLabel}>Allow direct messages</span>
                <span className={styles.toggleDescription}>
                  Other members can start a direct message conversation with you.
                </span>
              </div>
              <button
                className={`${styles.toggleSwitch} ${privacy.allow_dms ? styles.toggleActive : ""}`}
                onClick={() => handlePrivacyToggle("allow_dms")}
                role="switch"
                aria-checked={privacy.allow_dms}
              >
                <span className={styles.toggleSlider} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ===== Change Password ===== */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Change Password</h2>
        <p className={styles.cardDescription}>
          Update your password to keep your account secure.
        </p>

        <button
          className={styles.changePasswordButton}
          onClick={() => setActiveModal("changePassword")}
        >
          <Icon name="lock" size={20} />
          <span>Change Password</span>
        </button>
      </div>

      {/* ===== Account ===== */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Account</h2>

        <div className={styles.settingsList}>
          <button className={styles.logoutButton} onClick={handleLogout}>
            <Icon name="leave" size={20} />
            <span>Logout</span>
          </button>

          <div className={styles.dangerZone}>
            <button
              className={styles.deactivateButton}
              onClick={() => setActiveModal("deactivate")}
            >
              <Icon name="userX" size={20} />
              <span>Deactivate Account</span>
            </button>

            <button
              className={styles.deleteButton}
              onClick={() => setActiveModal("delete")}
            >
              <Icon name="trash" size={20} />
              <span>Delete Account</span>
            </button>
          </div>
        </div>
      </div>

      {/* ===== Modals ===== */}
      {activeModal && (
        <div className={styles.modalOverlay} onClick={() => {
          setActiveModal(null);
          setVerificationInput("");
          setPasswordError("");
          setPasswordForm({ current_password: "", new_password: "", confirm_password: "" });
        }}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button
              className={styles.modalCloseButton}
              onClick={() => {
                setActiveModal(null);
                setVerificationInput("");
                setPasswordError("");
                setPasswordForm({ current_password: "", new_password: "", confirm_password: "" });
              }}
              aria-label="Close"
            >
              ×
            </button>
            {activeModal === "changePassword" ? (
              <>
                <h2 className={styles.modalTitle}>Change Password</h2>
                <p className={styles.modalDescription}>
                  Enter your current password and choose a new one to update your account security.
                </p>
                <form className={styles.passwordForm} onSubmit={handleChangePassword}>
                  <div className={styles.formGroup}>
                    <label htmlFor="current_password" className={styles.inputLabel}>
                      Current Password
                    </label>
                    <input
                      id="current_password"
                      type="password"
                      className={styles.inputField}
                      value={passwordForm.current_password}
                      onChange={(e) =>
                        setPasswordForm((prev) => ({ ...prev, current_password: e.target.value }))
                      }
                      autoComplete="current-password"
                      placeholder="Enter current password"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="new_password" className={styles.inputLabel}>
                      New Password
                    </label>
                    <input
                      id="new_password"
                      type="password"
                      className={styles.inputField}
                      value={passwordForm.new_password}
                      onChange={(e) =>
                        setPasswordForm((prev) => ({ ...prev, new_password: e.target.value }))
                      }
                      autoComplete="new-password"
                      placeholder="Enter new password (min. 8 characters)"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="confirm_password" className={styles.inputLabel}>
                      Confirm New Password
                    </label>
                    <input
                      id="confirm_password"
                      type="password"
                      className={styles.inputField}
                      value={passwordForm.confirm_password}
                      onChange={(e) =>
                        setPasswordForm((prev) => ({ ...prev, confirm_password: e.target.value }))
                      }
                      autoComplete="new-password"
                      placeholder="Re-enter new password"
                    />
                  </div>

                  {passwordError && (
                    <p className={styles.fieldError} role="alert">{passwordError}</p>
                  )}

                  <div className={styles.modalActions}>
                    <button
                      type="button"
                      className={styles.cancelButton}
                      onClick={() => {
                        setActiveModal(null);
                        setPasswordError("");
                        setPasswordForm({ current_password: "", new_password: "", confirm_password: "" });
                      }}
                    >
                      Cancel
                    </button>
                    <button type="submit" className={styles.primaryButton}>
                      Update Password
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <h2 className={styles.modalTitle}>
                  {activeModal === "deactivate"
                    ? "Deactivate Account"
                    : "Delete Account"}
                </h2>
                <p className={styles.modalDescription}>
                  {activeModal === "deactivate"
                    ? "Your profile will be hidden and you'll be logged out. You can reactivate anytime by signing in again."
                    : "This action cannot be undone. All your data will be permanently removed from our servers."}
                </p>
                <div className={styles.formGroup} style={{ marginTop: "1rem" }}>
                  <label htmlFor="verification" className={styles.inputLabel}>
                    To confirm, type <strong>{activeModal === "deactivate" ? "deactivate" : "delete my account"}</strong> below:
                  </label>
                  <input
                    id="verification"
                    type="text"
                    className={styles.inputField}
                    value={verificationInput}
                    onChange={(e) => setVerificationInput(e.target.value)}
                    placeholder={activeModal === "deactivate" ? "deactivate" : "delete my account"}
                    autoComplete="off"
                  />
                </div>
                <div className={styles.modalActions}>
                  <button
                    className={styles.cancelButton}
                    onClick={() => {
                      setActiveModal(null);
                      setVerificationInput("");
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className={styles.confirmButton}
                    onClick={activeModal === "deactivate" ? handleDeactivate : handleDelete}
                    disabled={
                      isProcessing ||
                      (activeModal === "deactivate" && verificationInput !== "deactivate") ||
                      (activeModal === "delete" && verificationInput !== "delete my account")
                    }
                  >
                    {isProcessing
                      ? "Processing..."
                      : activeModal === "deactivate"
                      ? "Deactivate Account"
                      : "Delete My Account"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
