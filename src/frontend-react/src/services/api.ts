import type { LoginRequest } from "../types";

const url: string = "/api/";

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

function authHeaders(): Record<string, string> {
    const token: string | null = localStorage.getItem("token");
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) {
        headers["Authorization"] = "Bearer " + token;
    }
    return headers;
}
