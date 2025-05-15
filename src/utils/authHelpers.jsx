const BASE_URL = process.env.NEXT_PUBLIC_API_BASE;

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
        
        console.log("CSRF Token being sent:", getCookie("csrftoken"));

        const response = await fetch(`${BASE_URL}/user/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCookie("csrftoken"),
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
            const errorData = await response.json();
            return { error: errorData.email ? "The email has already been used." : "Something went wrong. Please try again." };
        }
    } catch (error) {
        console.error("Error:", error);
        return { error: "Something went wrong. Please try again." };
    }
};
