const BASE_URL = process.env.NEXT_PUBLIC_API_BASE || '';

export function getCookie(name) {
    if (typeof document === 'undefined') return null;
  
    const cookies = document.cookie.split('; ');
    for (let cookie of cookies) {
      const [key, value] = cookie.split('=');
      if (key === name) return decodeURIComponent(value);
    }
  
    return null;
  }

export function validateEmail(email) {
  const trimmedEmail = email.trim().toLowerCase();
  const emailRegex = /^[\w.!#$%&'*+/=?^`{|}~-]+@[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?(?:\.[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?)*$/i;
  const isValid = emailRegex.test(trimmedEmail);
  
  return isValid;
}


export async function fetchCsrfToken() {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/auth/csrf/`, {
      credentials: 'include',
    });
    const data = await res.json();
    return data.csrfToken;
  }

// Centralized API call function for authenticated requests
export async function authenticatedFetch(url, options = {}) {
  const { method = 'GET', body, headers = {}, ...restOptions } = options;
  
  // Get CSRF token for POST/PUT/PATCH/DELETE requests
  let csrfToken = null;
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase())) {
    csrfToken = await fetchCsrfToken();
  }
  
  // Prepare headers
  const requestHeaders = {
    ...headers,
  };
  
  // Add CSRF token if available
  if (csrfToken) {
    requestHeaders['X-CSRFToken'] = csrfToken;
  }
  
  // Prepare request options
  const requestOptions = {
    method,
    credentials: 'include',
    headers: requestHeaders,
    ...restOptions,
  };
  
  if (body) {
    requestOptions.body = body;
  }
  
  return fetch(url, requestOptions);
}


export const registerUser = async (formData) => {
  try {
    if (!validateEmail(formData.email)) {
      return { error: "Please enter a valid email address." };
    }

    const response = await authenticatedFetch(`${BASE_URL}/users/user/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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
