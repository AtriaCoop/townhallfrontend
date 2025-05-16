const BASE_URL = process.env.NEXT_PUBLIC_API_BASE;

export function getCookie(name) {
    if (typeof document === 'undefined') return null;
  
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let cookie of cookies) {
        cookie = cookie.trim();
        if (cookie.startsWith(name + '=')) {
          cookieValue = decodeURIComponent(cookie.slice(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
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
    // 🍪 Wait until cookie is actually readable
    const cookieCheck = () =>
      new Promise((resolve) => {
        const interval = setInterval(() => {
          const token = getCookie("csrftoken");
          if (token) {
            clearInterval(interval);
            resolve(token);
          }
        }, 100);
      });
  
    const csrfToken = await cookieCheck();
    console.log("CSRF Token being sent:", csrfToken); // should now show real value
  
    try {
      const response = await fetch(`${BASE_URL}/user/`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
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
          error: data.email || data.detail || "Something went wrong. Please try again.",
        };
      }
    } catch (error) {
      console.error("Error:", error);
      return { error: "Something went wrong. Please try again." };
    }
  };
  