const BASE_URL = process.env.NEXT_PUBLIC_API_BASE;

export const getCookie = (name) => {
    console.log("getCookie called");
    const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
    return match ? decodeURIComponent(match[2]) : null;
  };  

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
    let csrfToken = getCookie("csrftoken");

    // Wait up to 500ms if token is null
    if (!csrfToken) {
        await new Promise((res) => setTimeout(res, 500));
        csrfToken = getCookie("csrftoken");
    }

    console.log("CSRF Token being sent:", csrfToken);

    try {
        const response = await fetch(`${BASE_URL}/user/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": csrfToken,
            },
            credentials: "include",
            body: JSON.stringify({
                email: formData.email,
                password: formData.password,
            }),
        });

        if (response.ok) {
            const data = await response.json();
            return { success: "Account created successfully!", data };
        } else {
            const errorText = await response.text(); // safer logging
            console.error("Signup error:", errorText);
            return { error: "Something went wrong. Please try again." };
        }
    } catch (error) {
        console.error("Error:", error);
        return { error: "Something went wrong. Please try again." };
    }
};
