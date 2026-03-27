import { login } from "./api.js"
import { authAlreadyExists } from "./auth.js";
import { addFocus } from "./layout.js";

authAlreadyExists();

const form = document.getElementById("login-form");
form.addEventListener("submit", (event) => {
    event.preventDefault();
    handleLogin();
});

async function handleLogin() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (!email || !password) {
        showError("Please fill in all fields");
        return;
    }

    try {
        await login({ email, password });
        window.location.href = "workout.html";
    } catch (error) {
        showError("Invalid email or password");
    }
}

function showError(errorMessage) {
    const errorMessageDiv = document.getElementById("auth-message");
    errorMessageDiv.textContent = errorMessage;
    errorMessageDiv.style.display = 'block';
    document.getElementById("password").value = '';
}

addFocus();