// apiRequest.js
const BASE_URL = "http://localhost:8080";

// Common API function
async function apiRequest(endpoint, method = "GET", body = null) {
    const token = localStorage.getItem("token");

    const options = {
        method,
        headers: { "Content-Type": "application/json" }
    };

    if (token) {
        options.headers["Authorization"] = "Bearer " + token;
    }

    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(BASE_URL + endpoint, options);

        // Read response body as text
        const text = await response.text();
        let data;
        try {
            data = text ? JSON.parse(text) : null; // parse JSON if possible
        } catch {
            data = text; // fallback to plain text
        }

        if (!response.ok) {
            const errorMessage = data?.message || data || "Something went wrong";
            throw new Error(errorMessage);
        }

        return data;

    } catch (error) {
        console.error("API Error:", error.message);
        throw error;
    }
}