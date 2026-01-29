import styles from "@/pages/EditProfilePage/EditProfilePage.module.scss";
import Navigation from "@/components/Navigation/Navigation";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { authenticatedFetch } from "@/utils/authHelpers";
import Icon from "@/icons/Icon";
import { validateUrl } from "@/utils/validateUrl";
import FormInputText from "@/components/FormInputText/FormInputText";

export default function EditProfilePage({ hasNewDm }) {
  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE || "";
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
  const [saveStatus, setSaveStatus] = useState(null); // 'success' | 'error' | null
  const [saveMessage, setSaveMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const dismissTimerRef = useRef(null);

  const handleDeleteClick = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  useEffect(() => {
    async function fetchProfile() {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user || !user.id) return;

        const response = await authenticatedFetch(
          `${BASE_URL}/user/${user.id}/`
        );
        const data = await response.json();
        setProfileData(data.user);
        setFormData((prev) => ({
          ...prev,
          ...data.user,
        }));
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    }
    fetchProfile();
  }, []);

  async function handleUpdateProfile() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.id) {
      setSaveStatus("error");
      setSaveMessage("No user found. Please sign in again.");
      return;
    }

    // prevent profile update if any social media URLs are invalid
    if (!isUrlsValid()) return;

    // create form data payload
    const form = new FormData();

    for (const key in formData) {
      if (key !== "profile_image" && key !== "profile_header")
        form.append(key, formData[key]);
    }

    // Handle image files (if added)
    if (formData.profile_image instanceof File) {
      form.append("profile_image", formData.profile_image);
    }
    if (formData.profile_header instanceof File) {
      form.append("profile_header", formData.profile_header);
    }

    try {
      const response = await authenticatedFetch(
        `${BASE_URL}/user/${user.id}/`,
        {
          method: "PATCH",
          body: form,
        }
      );

      const data = await response.json();
      console.log({ data });

      if (!response.ok) {
        // Use backend error message or create specific message based on status
        let errorMessage = data.message || data.error || data.detail;

        if (!errorMessage) {
          switch (response.status) {
            case 400:
              errorMessage = "Invalid data provided";
              break;
            case 401:
              errorMessage = "Please sign in again";
              break;
            case 403:
              errorMessage = "You don't have permission to update this profile";
              break;
            case 404:
              errorMessage = "Profile not found";
              break;
            case 500:
              errorMessage = "Server error occurred";
              break;
            default:
              errorMessage = `Update failed (${response.status})`;
          }
        }
        setSaveStatus("error");
        setSaveMessage(errorMessage);
        return;
      }

      // store success toast data to show after page navigation
      sessionStorage.setItem(
        "toastAfterNav",
        JSON.stringify({
          type: "success",
          message: "Profile saved successfully.",
        })
      );

      // redirect to profile page
      router.push(`/ProfilePage/${profileData.id}`);
    } catch (err) {
      console.log({ err });
      console.error("Failed to update profile:", err);
    }
  }

  useEffect(() => {
    if (!saveStatus) return;
    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
    }
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
    console.log({ error });
    if (error) urlErrors[field] = error;
  }

  function isUrlsValid() {
    const errors = {};

    // validate urls
    if (formData.linkedin_url) getUrlError(errors, "linkedin_url");
    if (formData.x_url) getUrlError(errors, "x_url");
    if (formData.instagram_url) getUrlError(errors, "instagram_url");
    if (formData.facebook_url) getUrlError(errors, "facebook_url");

    // if any url has an error, show error messages
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
      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
      }
    }
  }

  function handleInputChange(e) {
    const { name, value } = e.target;

    setFormData({ ...formData, [name]: value });
    setFieldErrors({ ...fieldErrors, [name]: "" });

    if (saveStatus) {
      setSaveStatus(null);
      setSaveMessage("");
      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
      }
    }
  }

  return (
    <div className={styles.container}>
      <Navigation hasNewDm={hasNewDm} />

      <div className={styles.editProfileContainer}>
        <div className={styles.title}>
          <div
            className={styles.backBox}
            onClick={() => router.push(`/ProfilePage/${profileData.id}`)}
          >
            <Icon name="arrowleft" />
          </div>
          <h1>Account Settings</h1>
        </div>
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
        <label className={styles.profilePic} htmlFor="profileImageUpload">
          <img
            className={styles.profilePic}
            src={
              formData.profile_image instanceof File
                ? URL.createObjectURL(formData.profile_image)
                : profileData?.profile_image
                ? profileData.profile_image
                : "/assets/ProfileImage.jpg"
            }
            alt="Profile Image"
            title="Click to change"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/assets/ProfileImage.jpg";
            }}
          />
        </label>
        <input
          id="profileImageUpload"
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={(e) =>
            handleFieldChange({ profile_image: e.target.files[0] })
          }
        />
        <h3 className={styles.name}>{profileData?.full_name}</h3>
      </div>

      <div className={styles.inputs}>
        <FormInputText
          name="full_name"
          label="Full Name"
          placeholder="Enter full name..."
          value={formData.full_name}
          onChange={handleInputChange}
        />

        <FormInputText
          name="pronouns"
          label="Preferred Pronouns"
          placeholder="Share your pronouns (Optional)"
          value={formData.pronouns}
          onChange={handleInputChange}
        />

        {/* --- name pronunciation --- */}
        <FormInputText
          name="name_pronunciation"
          label="Name Pronunciation"
          placeholder="Enter name pronunciation..."
          value={formData.name_pronunciation}
          onChange={handleInputChange}
        />
        
        <FormInputText
          name="title"
          label="Title"
          placeholder="Enter title..."
          value={formData.title}
          onChange={handleInputChange}
        />

        <FormInputText
          name="primary_organization"
          label="Primary Organization"
          placeholder="What is the main organization you work for?"
          value={formData.primary_organization}
          onChange={handleInputChange}
        />

        <FormInputText
          name="other_organizations"
          label="Other Organization"
          placeholder="Enter other organizations you are a part of..."
          value={formData.other_organizations}
          onChange={handleInputChange}
        />

        <FormInputText
          name="other_networks"
          label="Other Networks"
          placeholder="List any coalitions or networks you are connected to other than the VFJC."
          value={formData.other_networks}
          onChange={handleInputChange}
        />

        <FormInputText
          name="about_me"
          label="About Me"
          placeholder="Tell us about yourself!"
          value={formData.about_me}
          onChange={handleInputChange}
        />

        <FormInputText
          name="skills_interests"
          label="Skills & Interests"
          placeholder="Enter any skills & interests that may benfeit the coalition."
          value={formData.skills_interests}
          onChange={handleInputChange}
        />

        <p>Profile Header</p>
        <div className={styles.profileHeaderInput}>
          <img
            src={
              formData.profile_header instanceof File
                ? URL.createObjectURL(formData.profile_header)
                : profileData?.profile_header
            }
            alt="Profile Header"
            title="Click to change"
            className={styles.clickableImage}
          />
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={(e) =>
            handleFieldChange({ profile_header: e.target.files[0] })
          }
          style={{ display: "none" }}
        />

        <FormInputText
          name="linkedin_url"
          label="Linkedin"
          type="url"
          placeholder="https://linkedin.com/in/username"
          value={formData.linkedin_url}
          onChange={handleInputChange}
          error={fieldErrors.linkedin_url}
        />

        <FormInputText
          name="x_url"
          label="X/Twitter"
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

        <button className={styles.saveButton} onClick={handleUpdateProfile}>
          SAVE
        </button>
      </div>

      {/* Delete account modal */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h1>Delete Account?</h1>
            <p>
              Are you sure you want to delete your account? You can't undo this.
            </p>
            <div className={styles.modalButton}>
              <button className={styles.delete}>DELETE MY ACCOUNT</button>
              <button className={styles.cancel} onClick={closeModal}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.deleteButton} onClick={handleDeleteClick}>
        <p>DELETE ACCOUNT</p>
      </div>
    </div>
  );
}
