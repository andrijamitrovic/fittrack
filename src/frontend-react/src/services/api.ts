
export const url: string = "/api/";

export function authHeaders(): Record<string, string> {
    const token: string | null = localStorage.getItem("token");
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) {
        headers["Authorization"] = "Bearer " + token;
    }
    return headers;
}

export function failedAuth() {
    localStorage.removeItem("token");
    throw new Error("Unauthorized");
}