import { register } from "./api.js"

const submitButton = document.getElementById("submitButton");
submitButton.addEventListener('click', handleRegister);

async function handleRegister(){
    let user = {
        displayName : document.getElementById("name").value,
        email : document.getElementById("email").value,
        password : document.getElementById("password").value
    }

    await register(user);
    window.location.href = "workout.html";
}