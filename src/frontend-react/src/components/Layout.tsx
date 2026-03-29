import { NavLink, Outlet, useNavigate } from "react-router";

export function Layout() {
    const navigate = useNavigate();

    function handleLogout() {
        localStorage.removeItem("token");
        navigate("login");
    }

    return (
        <>
            <nav>
                <ul>
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
                        <NavLink to='/workouts/new'>
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
            <header>
                <h1>FitTrack</h1>
            </header>
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