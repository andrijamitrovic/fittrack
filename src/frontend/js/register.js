import { register } from "./api.js"
import { addFocus } from "./layout.js";


authAlreadyExists();

const form = document.getElementById("register");
form.addEventListener("submit", (event) => {
    event.preventDefault();
    handleRegister();
});

async function handleRegister() {
    let user = {
        displayName: document.getElementById("name").value,
        email: document.getElementById("email").value,
        password: document.getElementById("password").value
    }

    if (!user.email || !user.password || !user.displayName) {
        showError("Please fill in all fields");
        return;
    }

    try {
        await register(user);
        window.location.href = "workout.html";
    } catch (error) {
        showError("Email is already taken");
    }

}

function showError(errorMessage) {
    const errorMessageDiv = document.getElementById("auth-message");
    errorMessageDiv.textContent = errorMessage;
    errorMessageDiv.style.display = 'block';
    document.getElementById("password").value = '';
}

addFocus();