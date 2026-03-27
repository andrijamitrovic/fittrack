const url = "http://localhost:8080/api/";

export async function loadExercises() {
    let response = await fetch(url + "Exercises", {
        method: "GET",
        headers: authHeaders(),
    });
    if(response.status === 401)
    {
        failedAuth();
    }    
    if(!response.ok)
        throw new Error(`Response status: ${response.status}`);
    let data = await response.json();
    return data;
}

export async function createWorkout(workout) {
    let response = await fetch(url + "Workouts", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(workout)
    })
    if(response.status === 401)
    {
        failedAuth();
    }    
    if(!response.ok)
        throw new Error(`Response status: ${response.status}`);
    let data = await response.json();
    return data;
}

export async function register(user) {
    let response = await fetch(url + "auth/register", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(user)
    })
    if(!response.ok)
        throw new Error(`Response status: ${response.status}`);
    let data = await response.json();
    localStorage.setItem("token", data.token);
    return data;
}

export async function login(user) {
    let response = await fetch(url + "auth/login", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(user)
    })
    if(!response.ok)
        throw new Error(`Response status: ${response.status}`);
    let data = await response.json();
    localStorage.setItem("token", data.token);
    return data;
}

export async function loadWorkouts() {
    let response = await fetch(url + "Workouts", {
        method: "GET",
        headers: authHeaders(),
    });
    if(response.status === 401)
    {
        failedAuth();
    }    
    if(!response.ok)
        throw new Error(`Response status: ${response.status}`);
    let data = await response.json();
    return data;
}


function authHeaders() {
    const token = localStorage.getItem("token");
    const headers = { "Content-Type": "application/json" };
    if (token) {
        headers["Authorization"] = "Bearer " + token;
    }
    return headers;
}

function failedAuth(){
    window.location.href = "login.html";
}


