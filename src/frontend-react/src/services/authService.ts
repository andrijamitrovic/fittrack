import { authHeaders, fetchWithAuthAsync, url } from "./api";
import type { AuthTokens, LoginRequest, RegisterRequest, User } from "../types";


export async function login(user: LoginRequest) {
    let response = await fetch(url + "auth/login", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(user)
    })
    if (!response.ok)
        throw new Error(`Response status: ${response.status}`);
    console.log(response);
    let data: AuthTokens = await response.json();
    console.log(data)
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
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
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    return data;
}

export async function getUsers() {
    let response = await fetchWithAuthAsync("auth", {
        method: "GET"
    })
    if (!response.ok)
        throw new Error(`Response status: ${response.status}`);
    let data: User[] = await response.json();
    return data;
}

export async function deleteUser(id: string) {
    let response = await fetchWithAuthAsync("auth/" + id, {
        method: "DELETE"
    })
    if (!response.ok)
        throw new Error(`Response status: ${response.status}`);
}