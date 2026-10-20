import { fetchWithAuthAsync, url } from "./api";
import type { User } from "../types";

let currentUserPromise: Promise<User | null> | null = null;

export function startGoogleLogin(returnUrl = "/app") {
    window.location.assign(
        `${url}external-auth/google/login?returnUrl=${encodeURIComponent(returnUrl)}`
    );
}

export function getCurrentUser(force = false): Promise<User | null> {
    if (!currentUserPromise || force) {
        currentUserPromise = fetch(`${url}external-auth/me`, {
            credentials: "include"
        }).then(async (response) => {
            if (response.status === 401) return null;
            if (!response.ok) throw new Error(`Response status: ${response.status}`);
            return response.json() as Promise<User>;
        });
    }

    return currentUserPromise;
}

export async function logout() {
    const response = await fetch(`${url}external-auth/logout`, {
        method: "POST",
        credentials: "include"
    });

    currentUserPromise = null;

    if (!response.ok) throw new Error(`Response status: ${response.status}`);
}

export async function getUsers() {
    const response = await fetchWithAuthAsync("external-auth/users", {
        method: "GET"
    })
    if (!response.ok)
        throw new Error(`Response status: ${response.status}`);
    const data: User[] = await response.json();
    return data;
}

export async function deleteUser(id: string) {
    const response = await fetchWithAuthAsync("external-auth/users/" + id, {
        method: "DELETE"
    })
    if (!response.ok)
        throw new Error(`Response status: ${response.status}`);
}
