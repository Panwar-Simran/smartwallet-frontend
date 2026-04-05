// auth.js
// ================= COMMON FUNCTIONS =================

// Email validation
function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Show error messages
function showError(message) {
    const errorDiv = document.getElementById("errorMsg");
    if (errorDiv) {
        errorDiv.innerText = message;
        errorDiv.style.display = "block";
    }
}

// Toggle any password field with eye icon
document.querySelectorAll('.password-wrapper i').forEach(icon => {
    icon.addEventListener('click', () => {
        const input = icon.previousElementSibling; // gets the input before the icon
        const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
        input.setAttribute('type', type);
        icon.classList.toggle('fa-eye-slash');
    });
});

// ================= REGISTER =================

const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", async function(e) {
        e.preventDefault();

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const phone = document.getElementById("phone_no").value.trim();
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        // 🔹 VALIDATIONS
        if (name.length < 3) return showError("Name must be at least 3 characters");
        if (!validateEmail(email)) return showError("Invalid email format");
        if (!/^[0-9]{10}$/.test(phone)) return showError("Phone must be exactly 10 digits");
        if (!/^(?=.*[@$!%*?&]).{6,}$/.test(password)) return showError("Password must be at least 6 characters and include a special character");
        if (password !== confirmPassword) return showError("Passwords do not match");

        // 🔹 API CALL
        try {
            const data = await apiRequest("/auth/register", "POST", {
                name, email, phone_no: phone, password
            });

            alert(data.message || "Registration successful!");
            window.location.href = "index.html";

        } catch (error) {
            showError(error.message);
        }
    });
}

// ================= LOGIN =================

const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async function(e) {
        e.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        // 🔹 VALIDATIONS
        if (!validateEmail(email)) return showError("Enter a valid email");
        if (password.length === 0) return showError("Password cannot be empty");

        // 🔹 API CALL
        try {
            const data = await apiRequest("/auth/login", "POST", { email, password });

            // Save JWT
            if (data.token) localStorage.setItem("token", data.token);

            // Redirect to wallet page
            window.location.href = "dashboard.html";

        } catch (error) {
            showError(error.message);
        }
    });
}