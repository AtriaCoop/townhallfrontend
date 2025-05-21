const BASE_URL = process.env.NEXT_PUBLIC_API_BASE;

export function getCookie(name) {
    const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
    return match ? decodeURIComponent(match[2]) : null;
  }

export const validatePassword = (password, confirmPassword) => {
    if (password.length < 11) {
        return "Password must be at least 11 characters long";
    }
    if (!isNaN(password)) {
        return "Password cannot be entirely numeric";
    }
    if (password !== confirmPassword) {
        return "Passwords do not match.";
    }
    return null;
};

export const registerUser = async (formData) => {
  try {
    const csrfToken = getCookie("csrftoken");
    console.log("CSRF Token being sent:", csrfToken);

    const response = await fetch(`/users/user/`, {
      method: "POST",
      credentials: "include", // ✅ send cookies
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken, // ✅ send csrf token
      },
      body: JSON.stringify({
        email: formData.email,
        password: formData.password,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      return { success: "Account created successfully!", data };
    } else {
      return {
        error:
          data.email || data.detail || "Something went wrong. Please try again.",
      };
    }
  } catch (error) {
    console.error("Error:", error);
    return { error: "Something went wrong. Please try again." };
  }
};
