
export const url: string = "/api/";

export function authHeaders(): Record<string, string> {
    return { "Content-Type": "application/json" };
}

export async function fetchWithAuthAsync(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const response = await fetch(url + endpoint, {
        ...options,
        credentials: "include",
        headers: { ...authHeaders(), ...options.headers }
    });

    if (response.status === 401) {
        if (!window.location.pathname.startsWith("/login")) {
            window.location.href = "/login";
        }
    }

    return response;
}
