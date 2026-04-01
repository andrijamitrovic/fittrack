import { authHeaders, url } from "./api";
import type { LoginRequest, RegisterRequest } from "../types";


export async function login(user: LoginRequest) {
    let response = await fetch(url + "auth/login", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(user)
    })
    if (!response.ok)
        throw new Error(`Response status: ${response.status}`);
    let data = await response.json();
    localStorage.setItem("token", data.token);
    return data;
}

export async function register(user: RegisterRequest) {
    let response = await fetch(url + "auth/register", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(user)
    })
    if (!response.ok)
        throw new Error(`Response status: ${response.status}`);
    let data = await response.json();
    localStorage.setItem("token", data.token);
    return data;
}