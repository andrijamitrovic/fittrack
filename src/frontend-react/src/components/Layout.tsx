import { NavLink, Outlet, useNavigate } from "react-router";
import { isAdmin } from "../utils/auth";
import { useState } from "react";

export function Layout() {
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();

    function closeMenu() {
        setMenuOpen(false);
    }

    function handleLogout() {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        closeMenu();
        navigate("/login");
    }

    return (
        <>
            <nav className="site-nav">
                <div className="nav-bar">
                    <NavLink to="/" className="nav-brand" onClick={closeMenu}>
                        <svg
                            className="fittrack-logo"
                            viewBox="0 0 36 36"
                            xmlns="http://www.w3.org/2000/svg"
                            aria-hidden="true"
                        >
                            <g fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                                <line x1={10} y1={18} x2={26} y2={18} />
                                <line x1={7} y1={13} x2={7} y2={23} />
                                <line x1={10} y1={11} x2={10} y2={25} />
                                <line x1={26} y1={11} x2={26} y2={25} />
                                <line x1={29} y1={13} x2={29} y2={23} />
                            </g>
                        </svg>
                        <span className="fittrack-text">Cadence</span>
                    </NavLink>

                    <button
                        type="button"
                        className="nav-toggle btn-link"
                        aria-expanded={menuOpen}
                        aria-controls="site-nav-panel"
                        onClick={() => setMenuOpen(open => !open)}
                    >
                        Menu
                    </button>
                </div>

                <div
                    id="site-nav-panel"
                    className={`nav-panel ${menuOpen ? "is-open" : ""}`}
                >
                    <ul className="nav-links">
                        <li>
                            <NavLink
                                to="/"
                                end
                                className={({ isActive }) => `nav-link${isActive ? " is-active" : ""}`}
                                onClick={closeMenu}
                            >
                                Dashboard
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="/workouts"
                                className={({ isActive }) => `nav-link${isActive ? " is-active" : ""}`}
                                onClick={closeMenu}
                            >
                                Workouts
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="/newworkout"
                                className={({ isActive }) => `nav-link${isActive ? " is-active" : ""}`}
                                onClick={closeMenu}
                            >
                                Add new workout
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="/templates"
                                className={({ isActive }) => `nav-link${isActive ? " is-active" : ""}`}
                                onClick={closeMenu}
                            >
                                Templates
                            </NavLink>
                        </li>

                        {isAdmin() && (
                            <>
                                <li>
                                    <NavLink
                                        to="/admin/users"
                                        className={({ isActive }) => `nav-link${isActive ? " is-active" : ""}`}
                                        onClick={closeMenu}
                                    >
                                        Users
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink
                                        to="/admin/exercises"
                                        className={({ isActive }) => `nav-link${isActive ? " is-active" : ""}`}
                                        onClick={closeMenu}
                                    >
                                        Exercises
                                    </NavLink>
                                </li>
                            </>
                        )}
                    </ul>
                </div>

                <div className="nav-actions">
                    <button type="button" onClick={handleLogout} className="btn-link">
                        Log Out
                    </button>
                </div>
            </nav>

            <main>
                <Outlet />
            </main>

            <footer>
                <p>Andrija MitroviÄ‡</p>
                <p>
                    <a
                        href="https://github.com/andrijamitrovic"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        My GitHub
                    </a>
                </p>
            </footer>
        </>
    );
}
