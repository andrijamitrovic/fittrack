import { useEffect, useState } from "react";
import { Navigate } from "react-router";
import { getCurrentUser } from "../services/authService";

export function PublicRoute({ children }: { children: React.ReactNode }) {

    const [authenticated, setAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
        getCurrentUser()
            .then((user) => setAuthenticated(user !== null))
            .catch(() => setAuthenticated(false));
    }, []);

    if (authenticated === null) return <p>Loading...</p>;
    if (authenticated) return <Navigate to='/app' replace />;

    return <>{children}</>
}
