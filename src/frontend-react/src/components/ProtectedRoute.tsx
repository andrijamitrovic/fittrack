import { useEffect, useState } from "react";
import { Navigate } from "react-router";
import { fetchWithAuthAsync, tryRefreshAsync } from "../services/api";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {

    const [checking, setChecking] = useState(true); 
    const [authenticated, setAuthenticated] = useState(false);

    useEffect(() => {
        async function checkAuth() {
            const accessToken = localStorage.getItem("accessToken");
            if (!accessToken) {
                setAuthenticated(false);
                setChecking(false);
                return;
            }

            const parts = accessToken.split('.');
            if (parts.length !== 3) {
                setAuthenticated(false);
                setChecking(false);
                return;
            }

            const payload = JSON.parse(atob(parts[1]));
            if (payload.exp > Date.now() / 1000) {
                setAuthenticated(true);
                setChecking(false);
                return;
            }

            const refreshed = await tryRefreshAsync();
            setAuthenticated(refreshed);
            setChecking(false);
        }

        checkAuth();
    }, []);



    if (checking) return <p>Loading...</p>
    if (!authenticated) return <Navigate to="/login" />

    return <>{children}</>
}