import { loadWorkouts } from "./api.js";
import { requireAuth } from "./auth.js";
import { addFocus, loadLayout } from "./layout.js";

loadLayout();

requireAuth();

const container = document.getElementsByClassName('container').item(0);
let data = await loadWorkouts();
addToPage(data);

function addToPage(workouts){
    workouts.forEach(workout => {
        const card = document.createElement('div');
        card.className = "card";
        const h3 = document.createElement('h3');
        const p = document.createElement('p');
        h3.textContent = workout.title;
        p.textContent = workout.date.split("T")[0];
        card.appendChild(h3);
        card.appendChild(p);

        workout.exercises.forEach(exercise => {
            let setsHTML = "";
            exercise.sets.forEach(set =>
                setsHTML += `<div class="set-row">Set ${set.setNumber}: ${set.reps} reps × ${set.weight}kg @ RPE ${set.rpe}</div>`
            )
            card.insertAdjacentHTML('beforeend', `
                <details>
                    <summary>${exercise.exerciseName} - ${exercise.sets.length} sets</summary>
                    ` + setsHTML + 
                    `
                </details>`);
        });

        container.appendChild(card);
    });
}

const search = document.getElementById("workout-search");
search.addEventListener("input", (event) => {
    let filteredData = data.filter((item) => item.title.toLowerCase().includes(event.target.value.toLowerCase())
                                                || item.date.split("T")[0].toLowerCase().includes(event.target.value.toLowerCase() ));
    container.innerHTML = '';
    addToPage(filteredData);
})


addFocus();