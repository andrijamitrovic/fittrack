import { Navigate } from "react-router";
import { isAdmin } from "../utils/auth";

export function AdminRoute({ children }: { children: React.ReactNode }) {
    if (!isAdmin()) {
        return <Navigate to="/" />;
    }
    return <>{children}</>;
}