import { Navigate } from "react-router";

export function PublicRoute({ children }: { children: React.ReactNode }) {

    const token = localStorage.getItem("token");
    if (token) {
        return <Navigate to='/' />;
    }

    return <>{children}</>
}