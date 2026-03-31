import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { register } from "../services/authService";

export function Register() {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    function handleChangeName(e: React.ChangeEvent<HTMLInputElement>) {
        setName(e.target.value);
    }

    function handleChangeEmail(e: React.ChangeEvent<HTMLInputElement>) {
        setEmail(e.target.value);
    }

    function handleChangePassword(e: React.ChangeEvent<HTMLInputElement>) {
        setPassword(e.target.value);
    }

    async function handleSubmit(e: React.SubmitEvent) {
        e.preventDefault();
        try {
            await register({
                displayName: name,
                email: email,
                password: password
            });
            navigate("/");
        }
        catch (error) {
            setError("Invalid email or password");
        }
    }

    return (
        <>
            <main className="auth-container">
                <h2>Register</h2>
                <div id="auth-message" />
                <form className="auth-form" id="register">
                    <label htmlFor="name">Name:
                        <input type="text" id="name" name="name" value={name} onChange={handleChangeName} />
                    </label>
                    <label htmlFor="email">Email
                        <input type="email" id="email" name="email" value={email} onChange={handleChangeEmail} />
                    </label>
                    <label htmlFor="password">Password
                        <input type="password" id="password" name="password" value={password} onChange={handleChangePassword} />
                    </label>
                    {error && <div className="error-message">{error}</div>}
                    <input type="submit" className="btn-submit" defaultValue="Register" onSubmit={handleSubmit}/>
                </form>
                <div>
                    Already have an account? <Link to="/login">Log In.</Link>
                </div>
            </main>
        </>


    );
}