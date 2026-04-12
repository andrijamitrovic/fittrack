

export function getUserRole(): string | null {
    const token = localStorage.getItem("accessToken");
    if (!token) return null;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.role || payload[Object.keys(payload).find(k => k.includes("role"))!] || null;
    } catch {
        return null;
    }
}

export function isAdmin(): boolean {
    return getUserRole() === "admin";
}