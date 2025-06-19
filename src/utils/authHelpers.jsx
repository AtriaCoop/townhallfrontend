const BASE_URL = process.env.NEXT_PUBLIC_API_BASE || '';

export function getCookie(name) {
  if (!document || !document.cookie) return null;

  const cookieString = document.cookie;
  const cookies = cookieString.split(';').map(c => c.trim());

  for (let cookie of cookies) {
      if (cookie.startsWith(name + '=')) {
          return decodeURIComponent(cookie.slice(name.length + 1));
      }
  }

  return null;
}

export const registerUser = async (formData) => {
  try {
    const csrfToken = getCookie("csrftoken");
    console.log("CSRF Token being sent:", csrfToken);

    const response = await fetch(`${BASE_URL}/users/user/`, {
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
          data.message || data.password || "Something went wrong. Please try again.",
      };
    }
  } catch (error) {
    console.error("Error:", error);
    return { error: "Something went wrong. Please try again." };
  }
};
