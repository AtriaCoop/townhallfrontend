import { useRef, useState, useCallback } from "react";
import { useRouter } from "next/router";
import styles from "./SetUpPage.module.scss";
import { authenticatedFetch } from "@/utils/authHelpers";
import { getStoredUser } from "@/utils/getStoredUser";
import { BASE_URL } from "@/constants/api";
import FormInputText from "@/components/FormInputText/FormInputText";
import { validateUrl } from "@/utils/validateUrl";

const INITIAL_FORM_DATA = {
  full_name: "",
  pronouns: "",
  title: "",
  primary_organization: "",
  other_organizations: "",
  other_networks: "",
  about_me: "",
  skills_interests: "",
  linkedin_url: "",
  x_url: "",
  instagram_url: "",
  facebook_url: "",
};

const URL_FIELDS = ["linkedin_url", "x_url", "instagram_url", "facebook_url"];

const UploadIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
    />
  </svg>
);

export default function SetUpPage() {
  const router = useRouter();

  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [profilePreview, setProfilePreview] = useState(null);
  const [headerPreview, setHeaderPreview] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const profilePicRef = useRef(null);
  const headerPicRef = useRef(null);

  const handleProfileUploadClick = () => {
    profilePicRef.current?.click();
  };

  const handleHeaderUploadClick = () => {
    headerPicRef.current?.click();
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePreview(URL.createObjectURL(file));
      setFieldErrors((prev) => ({ ...prev, profile_image: "" }));
    }
  };

  const handleHeaderPicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setHeaderPreview(URL.createObjectURL(file));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = useCallback(() => {
    const errors = {};

    // Required fields validation
    if (!formData.full_name.trim()) {
      errors.full_name = "Full name is required";
    }
    if (!formData.title.trim()) {
      errors.title = "Title is required";
    }
    if (!formData.primary_organization.trim()) {
      errors.primary_organization = "Primary organization is required";
    }

    // Profile picture required
    if (!profilePicRef.current?.files[0]) {
      errors.profile_image = "Profile picture is required";
    }

    // URL validation
    URL_FIELDS.forEach((field) => {
      if (formData[field]) {
        const urlError = validateUrl(formData[field], field);
        if (urlError) {
          errors[field] = urlError;
        }
      }
    });

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return false;
    }

    return true;
  }, [formData]);

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) return;

    const user = getStoredUser();
    if (!user?.id) {
      console.error("No user found in localStorage.");
      return;
    }

    setIsSubmitting(true);

    const form = new FormData();

    // Append all text fields
    Object.entries(formData).forEach(([key, value]) => {
      form.append(key, value);
    });

    // Append images if selected
    if (profilePicRef.current?.files[0]) {
      form.append("profile_image", profilePicRef.current.files[0]);
    }
    if (headerPicRef.current?.files[0]) {
      form.append("header_image", headerPicRef.current.files[0]);
    }

    try {
      const response = await authenticatedFetch(
        `${BASE_URL}/user/${user.id}/complete_profile/`,
        {
          method: "POST",
          body: form,
        }
      );

      if (response.ok) {
        router.push("/HomePage");
      } else {
        const data = await response.json();
        console.error("Error updating profile:", data);
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error("Request failed:", err);
      setIsSubmitting(false);
    }
  }, [formData, validateForm, router]);

  return (
    <div className={styles.pageContainer}>
      {/* Progress Header */}
      <header className={styles.progressHeader}>
        <div className={styles.logoLink}>
          <img
            src="/assets/atriaLogo.png"
            alt="Atria"
            className={styles.logo}
          />
        </div>
        <div className={styles.progressSteps}>
          <div className={styles.stepIndicator}>
            <div className={`${styles.stepDot} ${styles.completed}`} />
            <span className={styles.stepLabel}>Sign Up</span>
          </div>
          <div className={`${styles.stepConnector} ${styles.active}`} />
          <div className={styles.stepIndicator}>
            <div className={`${styles.stepDot} ${styles.active}`} />
            <span className={`${styles.stepLabel} ${styles.active}`}>
              Profile Setup
            </span>
          </div>
          <div className={styles.stepConnector} />
          <div className={styles.stepIndicator}>
            <div className={styles.stepDot} />
            <span className={styles.stepLabel}>Complete</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.mainContent}>
        <div className={styles.sectionHeader}>
          <h1 className={styles.sectionTitle}>Set up your profile</h1>
          <p className={styles.sectionSubtitle}>
            Tell us a bit about yourself so others can get to know you
          </p>
        </div>

        <div className={styles.formCard}>
          {/* Basic Information */}
          <section className={styles.formSection}>
            <h2 className={styles.formSectionTitle}>Basic Information</h2>
            <div className={styles.formGrid}>
              <div className={styles.formField}>
                <FormInputText
                  isRequired
                  name="full_name"
                  label="Full Name"
                  placeholder="Enter your full name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  error={fieldErrors.full_name}
                />
              </div>
              <div className={styles.formField}>
                <FormInputText
                  name="pronouns"
                  label="Pronouns"
                  placeholder="e.g., she/her, he/him, they/them"
                  value={formData.pronouns}
                  onChange={handleInputChange}
                />
              </div>
              <div className={styles.formField}>
                <FormInputText
                  isRequired
                  name="title"
                  label="Job Title"
                  placeholder="What is your role?"
                  value={formData.title}
                  onChange={handleInputChange}
                  error={fieldErrors.title}
                />
              </div>
              <div className={styles.formField}>
                <FormInputText
                  isRequired
                  name="primary_organization"
                  label="Primary Organization"
                  placeholder="Which organization do you represent?"
                  value={formData.primary_organization}
                  onChange={handleInputChange}
                  error={fieldErrors.primary_organization}
                />
              </div>
              <div className={`${styles.formField} ${styles.fullWidth}`}>
                <FormInputText
                  name="other_organizations"
                  label="Other Organizations"
                  placeholder="List any other organizations you're affiliated with"
                  value={formData.other_organizations}
                  onChange={handleInputChange}
                />
              </div>
              <div className={`${styles.formField} ${styles.fullWidth}`}>
                <FormInputText
                  name="other_networks"
                  label="Other Networks"
                  placeholder="Coalitions or networks you're connected to besides VFJC"
                  value={formData.other_networks}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </section>

          {/* About You */}
          <section className={styles.formSection}>
            <h2 className={styles.formSectionTitle}>About You</h2>
            <div className={styles.formGrid}>
              <div className={`${styles.formField} ${styles.fullWidth}`}>
                <FormInputText
                  name="about_me"
                  label="Bio"
                  placeholder="Share a bit about yourself - where you're from, your interests, and why food security matters to you"
                  value={formData.about_me}
                  onChange={handleInputChange}
                />
              </div>
              <div className={`${styles.formField} ${styles.fullWidth}`}>
                <FormInputText
                  name="skills_interests"
                  label="Skills & Interests"
                  placeholder="How would you like to contribute to the coalition?"
                  value={formData.skills_interests}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </section>

          {/* Profile Images */}
          <section className={styles.formSection}>
            <h2 className={styles.formSectionTitle}>Profile Images</h2>
            <div className={styles.formGrid}>
              <div className={styles.uploadSection}>
                <label className={styles.uploadLabel}>Profile Picture <span className={styles.required}>*</span></label>
                <div
                  className={`${styles.uploadArea} ${
                    profilePreview ? styles.hasPreview : ""
                  } ${fieldErrors.profile_image ? styles.uploadError : ""}`}
                  onClick={handleProfileUploadClick}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) =>
                    e.key === "Enter" && handleProfileUploadClick()
                  }
                >
                  {profilePreview ? (
                    <img
                      src={profilePreview}
                      alt="Profile preview"
                      className={styles.previewAvatar}
                    />
                  ) : (
                    <>
                      <div className={styles.uploadIcon}>
                        <UploadIcon />
                      </div>
                      <p className={styles.uploadText}>
                        <strong>Click to upload</strong> your photo
                      </p>
                      <p className={styles.uploadHint}>PNG, JPG up to 5MB</p>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  ref={profilePicRef}
                  onChange={handleProfilePicChange}
                  className={styles.hiddenInput}
                />
                {fieldErrors.profile_image && (
                  <p className={styles.fieldError}>{fieldErrors.profile_image}</p>
                )}
              </div>

              <div className={styles.uploadSection}>
                <label className={styles.uploadLabel}>Header Image</label>
                <div
                  className={`${styles.uploadArea} ${
                    headerPreview ? styles.hasPreview : ""
                  }`}
                  onClick={handleHeaderUploadClick}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) =>
                    e.key === "Enter" && handleHeaderUploadClick()
                  }
                >
                  {headerPreview ? (
                    <img
                      src={headerPreview}
                      alt="Header preview"
                      className={styles.previewImage}
                    />
                  ) : (
                    <>
                      <div className={styles.uploadIcon}>
                        <UploadIcon />
                      </div>
                      <p className={styles.uploadText}>
                        <strong>Click to upload</strong> a cover image
                      </p>
                      <p className={styles.uploadHint}>
                        Recommended: 1500x500px
                      </p>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  ref={headerPicRef}
                  onChange={handleHeaderPicChange}
                  className={styles.hiddenInput}
                />
              </div>
            </div>
          </section>

          {/* Social Links */}
          <section className={styles.formSection}>
            <h2 className={styles.formSectionTitle}>Social Links</h2>
            <div className={styles.socialLinksGrid}>
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
                label="X (Twitter)"
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
          </section>

          {/* Form Actions */}
          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.skipButton}
              onClick={() => router.push("/HomePage")}
            >
              Skip for now
            </button>
            <button
              type="button"
              className={styles.submitButton}
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Complete Setup"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
