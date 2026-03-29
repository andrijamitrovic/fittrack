import { Navigate } from "react-router";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {

    const token = localStorage.getItem("token");
    if (!token) {
        return <Navigate to='/login' />;
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
        throw new Error("Invalid token format");
    }

    const payload = JSON.parse(atob(parts[1]));

    if (payload.exp < Date.now() / 1000) {
        localStorage.removeItem("token");
        return <Navigate to='/login' />;
    }

    return <>{children}</>
}