import { useEffect, useState } from "react";
import type { User } from "../types";
import { deleteUser, getUsers } from "../services/authService";

export function AdminUsers() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [deleteId,setDeleteId] = useState<string | null>(null);

    async function deleteUserButton(userId: string) {
        setDeleteId(userId);
        try {
            await deleteUser(userId);
            const updatedUsers = await getUsers();
            setUsers(updatedUsers);
        } catch (err: any) {
            setError(err.message || "Failed to delete user");
        } finally {
            setDeleteId(null);
        }
    }

    useEffect(() => {
        getUsers()
            .then(setUsers)
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <p>Loading...</p>
    if (error) return <p>{error}</p>

    return (
        <>
            {
                users.map((user: User) => {
                    return (

                        <div className="card" key={user.id}>
                            <div className="cardHeader">
                                <h3>{user.displayName}</h3>
                                <p>{user.email}</p>
                                <button type="button" onClick={() => deleteUserButton(user.id!)}>{deleteId === user.id ? "Deleting..." : "Delete user"}</button>
                            </div>
                        </div>
                    );
                })
            }
        </>
    )
}