import { useState } from "react";
import { login } from "../services/authService";
import { Link, useNavigate } from "react-router";

export function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [password, setPassword] = useState("");

    function handleChangeEmail(e: React.ChangeEvent<HTMLInputElement>) {
        setEmail(e.target.value);
    }

    function handleChangePassword(e: React.ChangeEvent<HTMLInputElement>) {
        setPassword(e.target.value);
    }

    async function handleSubmit(e: React.SubmitEvent) {
        e.preventDefault();
        try {
            await login({
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
                <h2>Log In</h2>
                <form className="auth-form" id="login-form" onSubmit={handleSubmit}>

                    <label>E-mail:
                        <input type="email" name="email" id="email" value={email} required onChange={handleChangeEmail} />
                    </label>

                    <label>Password:
                        <input type="password" name="password" id="password" value={password} required onChange={handleChangePassword} />
                    </label>

                    {error && <div className="error-message">{error}</div>}

                    <input type="submit" className="btn-submit" defaultValue="Log In" />
                </form>

                <div className="link-container">
                    Don't have an account?
                    <Link to="/register">
                        Register here.
                    </Link>
                </div>
            </main>
        </>

    );
}