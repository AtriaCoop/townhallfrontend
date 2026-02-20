import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { authenticatedFetch } from "@/utils/authHelpers";
import { getStoredUser } from "@/utils/getStoredUser";
import { BASE_URL } from "@/constants/api";
import Icon from "@/icons/Icon";
import { validateUrl } from "@/utils/validateUrl";
import FormInputText from "@/components/FormInputText/FormInputText";
import styles from "./EditProfilePage.module.scss";

export default function EditProfilePage() {
  const router = useRouter();

  const [showModal, setShowModal] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [formData, setFormData] = useState({
    full_name: "",
    pronouns: "",
    name_pronunciation: "", //NEW MODIFICATIONS
    title: "",
    primary_organization: "",
    other_organizations: "",
    other_networks: "",
    about_me: "",
    skills_interests: "",
    profile_image: null,
    profile_header: null,
    linkedin_url: "",
    x_url: "",
    instagram_url: "",
    facebook_url: "",
  });
  const [saveStatus, setSaveStatus] = useState(null);
  const [saveMessage, setSaveMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const dismissTimerRef = useRef(null);

  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  const handleDeleteAccount = async () => {
    const user = getStoredUser();
    if (!user?.id) return;

    setIsDeleting(true);
    try {
      const res = await authenticatedFetch(`${BASE_URL}/user/${user.id}/`, {
        method: "DELETE",
      });

      if (res.ok) {
        localStorage.clear();
        sessionStorage.clear();
        router.push("/LoginPage");
      } else {
        const data = await res.json().catch(() => ({}));
        setSaveStatus("error");
        setSaveMessage(data.message || "Failed to delete account. Please try again.");
        setShowModal(false);
      }
    } catch (err) {
      console.error("Failed to delete account:", err);
      setSaveStatus("error");
      setSaveMessage("Failed to delete account. Please try again.");
      setShowModal(false);
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    async function fetchProfile() {
      try {
        const user = getStoredUser();
        if (!user || !user.id) return;

        const response = await authenticatedFetch(`${BASE_URL}/user/${user.id}/`);
        const data = await response.json();
        setProfileData(data.user);
        setFormData((prev) => {
          const updated = { ...prev };
          for (const key of Object.keys(prev)) {
            if (key in data.user) {
              updated[key] =
                key === "profile_image" || key === "profile_header"
                  ? data.user[key]
                  : data.user[key] ?? "";
            }
          }
          return updated;
        });
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    }
    fetchProfile();
  }, []);

  async function handleUpdateProfile() {
    const user = getStoredUser();
    if (!user || !user.id) {
      setSaveStatus("error");
      setSaveMessage("No user found. Please sign in again.");
      return;
    }

    if (!isUrlsValid()) return;

    const form = new FormData();
    for (const key in formData) {
      if (key !== "profile_image" && key !== "profile_header") {
        form.append(key, formData[key]);
      }
    }

    if (formData.profile_image instanceof File) {
      form.append("profile_image", formData.profile_image);
    }
    if (formData.profile_header instanceof File) {
      form.append("profile_header", formData.profile_header);
    }

    try {
      const response = await authenticatedFetch(`${BASE_URL}/user/${user.id}/`, {
        method: "PATCH",
        body: form,
      });

      const data = await response.json();

      if (!response.ok) {
        let errorMessage = data.message || data.error || data.detail;
        if (!errorMessage) {
          switch (response.status) {
            case 400: errorMessage = "Invalid data provided"; break;
            case 401: errorMessage = "Please sign in again"; break;
            case 403: errorMessage = "You don't have permission to update this profile"; break;
            case 404: errorMessage = "Profile not found"; break;
            case 500: errorMessage = "Server error occurred"; break;
            default: errorMessage = `Update failed (${response.status})`;
          }
        }
        setSaveStatus("error");
        setSaveMessage(errorMessage);
        return;
      }

      sessionStorage.setItem(
        "toastAfterNav",
        JSON.stringify({ type: "success", message: "Profile saved successfully." })
      );
      router.push(`/ProfilePage/${profileData.id}`);
    } catch (err) {
      console.error("Failed to update profile:", err);
    }
  }

  useEffect(() => {
    if (!saveStatus) return;
    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    dismissTimerRef.current = setTimeout(() => {
      setSaveStatus(null);
      setSaveMessage("");
    }, 3500);
    return () => {
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    };
  }, [saveStatus]);

  function getUrlError(urlErrors, field) {
    const error = validateUrl(formData[field], field);
    if (error) urlErrors[field] = error;
  }

  function isUrlsValid() {
    const errors = {};
    if (formData.linkedin_url) getUrlError(errors, "linkedin_url");
    if (formData.x_url) getUrlError(errors, "x_url");
    if (formData.instagram_url) getUrlError(errors, "instagram_url");
    if (formData.facebook_url) getUrlError(errors, "facebook_url");

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setSaveStatus("error");
      setSaveMessage("Please fix the errors below before saving.");
      return false;
    }
    return true;
  }

  function handleFieldChange(patch) {
    setFormData({ ...formData, ...patch });
    if (saveStatus) {
      setSaveStatus(null);
      setSaveMessage("");
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    }
  }

  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setFieldErrors({ ...fieldErrors, [name]: "" });
    if (saveStatus) {
      setSaveStatus(null);
      setSaveMessage("");
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    }
  }

  return (
    <div className={styles.editProfilePage}>
      {/* Toast Notification */}
      {saveStatus && (
        <div
          className={`${styles.toast} ${
            saveStatus === "success" ? styles.toastSuccess : styles.toastError
          }`}
          role="status"
          aria-live="assertive"
        >
          {saveMessage}
        </div>
      )}

      {/* Page Header */}
      <div className={styles.pageHeader}>
        <button
          className={styles.backButton}
          onClick={() => router.push(`/ProfilePage/${profileData?.id}`)}
          aria-label="Go back to profile"
        >
          <Icon name="arrowleft" size={20} />
        </button>
        <h1 className={styles.pageTitle}>Edit Profile</h1>
      </div>

      {/* Profile Card */}
      <div className={styles.profileCard}>
        <div className={styles.profileImageSection}>
          <label htmlFor="profileImageUpload" className={styles.profileImageLabel}>
            <img
              src={
                formData.profile_image instanceof File
                  ? URL.createObjectURL(formData.profile_image)
                  : profileData?.profile_image || "/assets/ProfileImage.jpg"
              }
              alt="Profile"
              className={styles.profileImage}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/assets/ProfileImage.jpg";
              }}
            />
            <div className={styles.editOverlay}>
              <Icon name="pencil" size={16} />
            </div>
          </label>
          <input
            id="profileImageUpload"
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => {
              if (e.target.files[0]) handleFieldChange({ profile_image: e.target.files[0] });
            }}
          />
        </div>
        <div className={styles.profileInfo}>
          <h2 className={styles.profileName}>{profileData?.full_name || "Your Name"}</h2>
          <p className={styles.profileEmail}>{profileData?.email}</p>
        </div>
      </div>

      {/* Banner Image */}
      <div className={styles.bannerSection}>
        <label htmlFor="bannerImageUpload" className={styles.bannerImageLabel}>
          <img
            src={
              formData.profile_header instanceof File
                ? URL.createObjectURL(formData.profile_header)
                : profileData?.profile_header || "/assets/defaultBanner.svg"
            }
            alt="Banner"
            className={styles.bannerImage}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/assets/defaultBanner.svg";
            }}
          />
          <div className={styles.bannerEditOverlay}>
            <Icon name="pencil" size={16} />
            <span>Change Banner</span>
          </div>
        </label>
        <input
          id="bannerImageUpload"
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={(e) => {
            if (e.target.files[0]) handleFieldChange({ profile_header: e.target.files[0] });
          }}
        />
      </div>

      {/* Form Sections */}
      <div className={styles.formSections}>
        {/* Basic Information */}
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>Basic Information</h3>
          <div className={styles.formGrid}>
            <FormInputText
              name="full_name"
              label="Full Name"
              placeholder="Enter your full name"
              value={formData.full_name}
              onChange={handleInputChange}
            />
            <FormInputText
              name="pronouns"
              label="Pronouns"
              placeholder="e.g., He/Him, She/Her, They/Them"
              value={formData.pronouns}
              onChange={handleInputChange}
            />
            <FormInputText
              name="title"
              label="Title"
              placeholder="Your role or title"
              value={formData.title}
              onChange={handleInputChange}
            />
          </div>
        </div>

        {/* Organizations */}
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>Organizations</h3>
          <div className={styles.formGrid}>
            <FormInputText
              name="primary_organization"
              label="Primary Organization"
              placeholder="Your main organization"
              value={formData.primary_organization}
              onChange={handleInputChange}
            />
            <FormInputText
              name="other_organizations"
              label="Other Organizations"
              placeholder="Other organizations you're part of"
              value={formData.other_organizations}
              onChange={handleInputChange}
            />
            <FormInputText
              name="other_networks"
              label="Other Networks"
              placeholder="Coalitions or networks beyond VFJC"
              value={formData.other_networks}
              onChange={handleInputChange}
            />
          </div>
        </div>

        {/* About */}
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>About</h3>
          <div className={styles.formGrid}>
            <FormInputText
              name="about_me"
              label="About Me"
              placeholder="Tell us about yourself"
              value={formData.about_me}
              onChange={handleInputChange}
            />
            <FormInputText
              name="skills_interests"
              label="Skills & Interests"
              placeholder="Skills and interests that benefit the coalition"
              value={formData.skills_interests}
              onChange={handleInputChange}
            />
          </div>
        </div>

        {/* Social Links */}
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>Social Links</h3>
          <div className={styles.formGrid}>
            <FormInputText
              name="linkedin_url"
              label="LinkedIn"
              type="url"
              placeholder="https://linkedin.com/in/username"
              value={formData.linkedin_url}
              onChange={handleInputChange}
              error={fieldErrors.linkedin_url}
            />
            <FormInputText
              name="x_url"
              label="X / Twitter"
              type="url"
              placeholder="https://x.com/username"
              value={formData.x_url}
              onChange={handleInputChange}
              error={fieldErrors.x_url}
            />
            <FormInputText
              name="facebook_url"
              label="Facebook"
              type="url"
              placeholder="https://facebook.com/username"
              value={formData.facebook_url}
              onChange={handleInputChange}
              error={fieldErrors.facebook_url}
            />
            <FormInputText
              name="instagram_url"
              label="Instagram"
              type="url"
              placeholder="https://instagram.com/username"
              value={formData.instagram_url}
              onChange={handleInputChange}
              error={fieldErrors.instagram_url}
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className={styles.actionButtons}>
        <button className={styles.saveButton} onClick={handleUpdateProfile}>
          Save Changes
        </button>
        <button className={styles.deleteAccountButton} onClick={handleDeleteClick}>
          Delete Account
        </button>
      </div>

      {/* Delete Modal */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Delete Account?</h2>
            <p className={styles.modalDescription}>
              Are you sure you want to delete your account? This action cannot be undone.
            </p>
            <div className={styles.modalActions}>
              <button className={styles.cancelButton} onClick={closeModal}>
                Cancel
              </button>
              <button
                className={styles.confirmDeleteButton}
                onClick={handleDeleteAccount}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete My Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
