import { login } from "./api.js"

const submitButton = document.getElementById("submitButton");
submitButton.addEventListener('click', handleLogin);

async function handleLogin(){
    let user = {
        email : document.getElementById("email").value,
        password : document.getElementById("password").value
    }

    await login(user);
    window.location.href = "workout.html";
}