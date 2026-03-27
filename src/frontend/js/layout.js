export function loadLayout() {
    document.body.insertAdjacentHTML('afterbegin', ` 
            <nav>
                <ul>
                    <li><a href="workoutViewer.html" class="active-link">Workouts</a></li>
                    <li><a href="workout.html">Add new workout</a></li>
                    <li><a href="index.html">Exercises</a></li>
                    <li class="push"><a id="btn-log-out" href="">Log Out</a></li>
                </ul> 
            </nav>
            <header>
                <h1>FitTrack</h1>
            </header>
        `);

    document.body.insertAdjacentHTML('beforeend', `
            <footer>
                <p>Andrija Mitrović </p> 
                <p><a href="https://github.com/andrijamitrovic">My github</a></p>
            </footer>
        `);

    const logoutBtn = document.getElementById("btn-log-out");

    if (logoutBtn) { 
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem("token");
            window.location.href = 'login.html';
        });
    };

    
}

export function addFocus() {
    document.querySelectorAll('input').forEach(input => {
    input.addEventListener('focus', () => {
        setTimeout(() => {
            input.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
    });
});
}