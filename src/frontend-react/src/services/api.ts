
export const url: string = "/api/";

export function authHeaders(): Record<string, string> {
    const token: string | null = localStorage.getItem("accessToken");
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) {
        headers["Authorization"] = "Bearer " + token;
    }
    return headers;
}

export async function tryRefreshAsync(): Promise<boolean> {
    const refreshToken: string | null = localStorage.getItem("refreshToken");
    if (!refreshToken) return false;

    const response = await fetch(url + "auth/refresh-token/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken })
    })

    if (!response.ok) return false;

    const data = await response.json();

    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);

    return true;
}

export async function fetchWithAuthAsync(endpoint: string, options: RequestInit = {}): Promise<Response> {
    options.headers = { ...authHeaders(), ...options.headers };
    let response = await fetch(url + endpoint, options);

    if (response.status === 401) {
        const refreshed = await tryRefreshAsync();
        if (refreshed) { 
            options.headers = {...authHeaders(), ...options.headers};
            response = await fetch(url + endpoint, options);
        } else {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            window.location.href = "/login";
        }
    }

    return response;
}