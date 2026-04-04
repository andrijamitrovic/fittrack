import { NavLink, Outlet, useNavigate } from "react-router";

export function Layout() {
    const navigate = useNavigate();

    function handleLogout() {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        navigate("/login");
    }

    return (
        <>
            <nav>
                <ul>
                    <li className="logo">
                        <svg
                            className="fittrack-logo"
                            viewBox="0 0 36 36"
                            xmlns="http://www.w3.org/2000/svg"
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

                    </li>


                    <li>
                        <NavLink to='/'>
                            Dashboard
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to='/workouts'>
                            Workouts
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to='/newworkout'>
                            Add new workout
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to='/templates'>
                            Templates
                        </NavLink>
                    </li>


                    <li className="push">
                        <button onClick={handleLogout} className="btn-link">Log Out</button>
                    </li>
                </ul>
            </nav>
            <main>
                <Outlet />
            </main>
            <footer>
                <p>Andrija Mitrović</p>
                <p><a href="https://github.com/andrijamitrovic" target="_blank" rel="noopener noreferrer">My GitHub</a></p>
            </footer>
        </>

    )
}