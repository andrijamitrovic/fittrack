import { loadExercises } from "./api.js";
import { createWorkout } from "./api.js";
import { requireAuth } from "./auth.js";
import { addFocus, loadLayout } from "./layout.js";

loadLayout();

requireAuth();

let id = 1;
const workoutButton = document.getElementById("workoutButton");
workoutButton.addEventListener("click", addExercise);
const exerciseDiv = document.getElementById("exercise");
const data = await loadExercises();
const saveWorkoutButton = document.getElementById("saveWorkout");
saveWorkoutButton.addEventListener('click', saveWorkout);

function saveWorkout() {
    let workout = {
        title : document.getElementById("title").value,
        notes : document.getElementById("notes").value,
// FILL IN LATER        durationMin : parseInt(document.getElementById("durationHour").value) * 60 + parseInt(document.getElementById("durationMin").value), 
        durationMin: 1,
        workoutExercises : getWorkoutExercises(Array.from(document.querySelectorAll(".exercise-group")))
    }

    console.log(workout);
    createWorkout(workout);
}

function getWorkoutExercises(exerciseGroups){
    let workoutExercises = [];

    exerciseGroups.forEach((element, index) => {

        const exerciseId = element.querySelector('.exercise-select').value;

        let workoutExercise = {
                exerciseId : exerciseId,
                orderIndex : index + 1,
                notes : "EMPTY STRING",
                exerciseSets : getSets(Array.from(element.querySelectorAll('[class^="set-"]')))
        }
        workoutExercises.push(workoutExercise);
    })


    return workoutExercises;
} 

function getSets(setDivs){
    let sets = [];
    setDivs.forEach((setDiv, index) => {
        sets.push({
            setNumber: index + 1,
            reps: parseInt(setDiv.querySelector('.reps').value),
            weight: parseFloat(setDiv.querySelector('.weight').value),
            rpe: parseFloat(setDiv.querySelector('.rpe').value),
// FILL LATER            isWarmup: setDiv.querySelector('.isWarmup').checked
            isWarmup: false
        });
    });
    return sets;
}

function addSet(exerciseId) {
    const exercise = document.getElementById("exercise-group-" + exerciseId);
    exercise.insertAdjacentHTML('beforeend', `
        <div class="set-${exerciseId}">

            <label for="reps">Reps: </label>
            <input type="number" min="1" max="100" class="reps" name="reps" id="reps">

            <label for="weight">Weight: </label>
            <input type="number" min="1" max="1000" class="weight" name="weight" id="weight">
        
            <label for="rpe">RPE: </label>
            <input type="number" min="1" max="10" class="rpe" name="rpe" id="rpe">
        
            <!-- <label for="isWarmup">Is a warmup? </label>
             <input type="checkbox" class="isWarmup" name="isWarmup" id="isWarmup"> -->
        
        </div>
        `);
}

function addExercise() {
    const currentId = id;
    exerciseDiv.insertAdjacentHTML('beforeend', `
        <div id="exercise-group-${currentId}" class="exercise-group">
            <label for="setButton${currentId}">Exercise: </label>
            <input type="button" value="Add set" id="setButton${currentId}">
        </div>
    `);

    let setButton = document.getElementById("setButton" + currentId);
    setButton.addEventListener("click", () => addSet(currentId));

    const exerciseGroup = document.getElementById("exercise-group-" + currentId);
    exerciseGroup.insertBefore(createExerciseSelect(currentId), exerciseGroup.querySelector('#setButton' + currentId));

    id += 1;
}

function createExerciseSelect(exerciseId) {
    const select = document.createElement("select");
    select.id = "exercise-select-" + exerciseId;
    select.className = "exercise-select";
    data.forEach(element => {
        const option = document.createElement("option");
        option.value = element.id;
        option.textContent = element.name;
        select.append(option);
    });
    return select;
}

addFocus();