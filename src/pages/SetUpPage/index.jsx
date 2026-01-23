import styles from "@/pages/SetUpPage/SetUpPage.module.scss";
import { useRef } from "react";
import { useRouter } from "next/router";
import { useState } from "react";
import { authenticatedFetch } from "@/utils/authHelpers";
import FormInputText from "@/components/FormInputText/FormInputText";
import { validateUrl } from "@/utils/validateUrl";

export default function SetUpPage() {
  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE || "";

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
    linkedin_url: "",
    x_url: "",
    instagram_url: "",
    facebook_url: "",
  });
  const [profilePreview, setProfilePreview] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const router = useRouter();

  const profilePicRef = useRef(null);
  const headerPicRef = useRef(null);

  const handleProfileUploadClick = () => profilePicRef.current.click();

  const handleHeaderUploadClick = () => headerPicRef.current.click();

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePreview(URL.createObjectURL(file));
      console.log("Selected profile picture:", file);
    }
  };

  const handleHeaderPicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log("Selected header picture:", file);
    }
  };

  const handleCompleteClick = async () => {
    // prevent profile update if form inputs are invalid
    if (!isFormValid()) return;

    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.id) {
      console.error("No user found in localStorage.");
      return;
    }

    const form = new FormData();

    // Append all text fields
    for (const key in formData) {
      form.append(key, formData[key]);
    }

    // Append profile image if selected
    if (profilePicRef.current.files[0]) {
      form.append("profile_image", profilePicRef.current.files[0]);
    }

    // console.log("📦 Sending PATCH to backend with:", formData);

    try {
      const response = await authenticatedFetch(
        `${BASE_URL}/user/${user.id}/complete_profile/`,
        {
          method: "POST",
          body: form,
        }
      );

      if (response.ok) {
        console.log("Profile updated with image!");
        router.push("/");
      } else {
        const data = await response.json();
        console.error("Error updating profile:", data);
      }
    } catch (err) {
      console.error("Request failed:", err);
    }
  };

  function getUrlError(urlErrors, field) {
    const error = validateUrl(formData[field], field);
    if (error) urlErrors[field] = error;
  }

  function isFormValid() {
    const errors = {};

    // validate required fields
    if (!formData.full_name.trim())
      errors["full_name"] = "Full name is required";
    if (!formData.title.trim()) errors["title"] = "Title is required";
    if (!formData.primary_organization.trim())
      errors["primary_organization"] = "Primary organization is required";

    // validate urls
    if (formData.linkedin_url) getUrlError(errors, "linkedin_url");
    if (formData.x_url) getUrlError(errors, "x_url");
    if (formData.instagram_url) getUrlError(errors, "instagram_url");
    if (formData.facebook_url) getUrlError(errors, "facebook_url");

    // if any url has an error, show error messages
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return false;
    }

    return true;
  }

  function handleInputChange(e) {
    const { name, value } = e.target;

    setFormData({ ...formData, [name]: value });
    setFieldErrors({ ...fieldErrors, [name]: "" });
  }

  return (
    <div>
      {/* Navigation */}
      <div className={styles.navigationContainer}>
        <div className={styles.navigation}>
          <img src="/assets/test.png" alt="Overview" />
          <p>Overview</p>
        </div>
        <div className={styles.navigation}>
          <img src="/assets/test.png" alt="Complete" />
          <p>Complete</p>
        </div>
      </div>

      {/* Set Up */}
      <div className={styles.setUpContainer}>
        <div className={styles.title}>
          <h2>Let's set up your profile</h2>
          <p>We'll start with the basics:</p>
        </div>
        <div className={styles.inputs}>
          <FormInputText
            isRequired
            name="full_name"
            label="Full Name"
            placeholder="Enter full name..."
            value={formData.full_name}
            onChange={handleInputChange}
            error={fieldErrors.full_name}
          />

          <FormInputText
            name="pronouns"
            label="What are your pronouns?"
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
            isRequired
            name="title"
            label="Title"
            placeholder="What is your job title?"
            value={formData.title}
            onChange={handleInputChange}
            error={fieldErrors.title}
          />

          <FormInputText
            isRequired
            name="primary_organization"
            label="Primary Organization"
            placeholder="What organization do you work for?"
            value={formData.primary_organization}
            onChange={handleInputChange}
            error={fieldErrors.primary_organization}
          />

          <FormInputText
            name="other_organizations"
            label="Other Organization"
            placeholder="Are there other organizations you work for?"
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
            placeholder="Where are you from? What do you like to do outside of work? Why is food security important to you?"
            value={formData.about_me}
            onChange={handleInputChange}
          />

          <FormInputText
            name="skills_interests"
            label="Skills & Interests"
            placeholder="Are there specific ways you’d like to contribute to the coalition?"
            value={formData.skills_interests}
            onChange={handleInputChange}
          />

          <p>Profile Picture</p>
          <div
            className={styles.uploadButton}
            onClick={handleProfileUploadClick}
          >
            {profilePreview ? (
              <img
                src={profilePreview}
                alt="Preview"
                className={styles.previewImage}
              />
            ) : (
              <span>Upload Photo</span>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            ref={profilePicRef}
            onChange={handleProfilePicChange}
            style={{ display: "none " }}
          />
          <p>Profile Header Photo</p>
          <div
            className={styles.uploadButton}
            onClick={handleHeaderUploadClick}
          >
            Upload Header Photo
          </div>
          <input
            type="file"
            accept="image/*"
            ref={headerPicRef}
            onChange={handleHeaderPicChange}
            style={{ display: "none " }}
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

          <button
            className={styles.completeButton}
            onClick={handleCompleteClick}
          >
            Complete
          </button>
        </div>
      </div>
    </div>
  );
}
