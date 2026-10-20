import { useEffect, useState } from "react";
import { Navigate } from "react-router";
import { getCurrentUser } from "../services/authService";

export function AdminRoute({ children }: { children: React.ReactNode }) {
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

    useEffect(() => {
        getCurrentUser()
            .then((user) => setIsAdmin(user?.roles.includes("admin") ?? false))
            .catch(() => setIsAdmin(false));
    }, []);

    if (isAdmin === null) return <p>Loading...</p>;
    if (!isAdmin) return <Navigate to="/app" replace />;
    return <>{children}</>;
}
