import { loadExercises } from "./api.js";
import { createWorkout } from "./api.js";

let id = 1;
const workoutButton = document.getElementById("workoutButton");
workoutButton.addEventListener("click", addExercise);
const exerciseDiv = document.getElementById("exercise");
const data = await loadExercises();
const dataList = await addDataListOptions();
const saveWorkoutButton = document.getElementById("saveWorkout");
saveWorkoutButton.addEventListener('click', saveWorkout);

function saveWorkout() {
    let workout = {
        userId : "b1e4c7a2-3d5f-4b8e-9a1c-6f2d8e3b5a7c",
        title : document.getElementById("title").value,
        notes : document.getElementById("notes").value,
        durationMin : parseInt(document.getElementById("durationHour").value) * 60 + parseInt(document.getElementById("durationMin").value), 
        workoutExercises : getWorkoutExercises(Array.from(document.querySelectorAll(".exercise-group")))
    }

    console.log(workout);
    createWorkout(workout);
}

function getWorkoutExercises(exerciseGroups){
    let workoutExercises = [];

    exerciseGroups.forEach((element, index) => {
        const exerciseName = element.querySelector('input[list]').value;

        const exercise = data.find(e => e.name === exerciseName);
        


        let workoutExercise = {
                exerciseId : exercise.id,
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
            isWarmup: setDiv.querySelector('.isWarmup').checked
        });
    });
    return sets;
}

function addSet(exerciseId) {
    const exercise = document.getElementById("exercise-group-" + exerciseId);
    exercise.insertAdjacentHTML('beforeend', `
        <div class="set-${exerciseId}">
            <label for="setNumber">Set number: </label>
            <input type="number" min="1" max="100" class="setNumber" name="setNumber">

            <label for="reps">Reps: </label>
            <input type="number" min="1" max="100" class="reps" name="reps">

            <label for="weight">Weight: </label>
            <input type="number" min="1" max="1000" class="weight" name="weight">
        
            <label for="rpe">RPE: </label>
            <input type="number" min="1" max="10" class="rpe" name="rpe">
        
            <label for="isWarmup">Is a warmup? </label>
            <input type="checkbox" class="isWarmup" name="isWarmup">
        
        </div>
        `);
}

function addExercise() {
    const currentId = id;
    exerciseDiv.insertAdjacentHTML('beforeend', `
            <div id="exercise-group-${id}" class="exercise-group">
                <label for="exercise">Exercise: </label>
                <input list="exercises" id="exercise${id}" name="exercise${id}">
                <input type="button" value="Add set" id="setButton${id}">
            </div>
        `);
    let setButton = document.getElementById("setButton" + id);
    setButton.addEventListener("click", () => addSet(currentId));
    exerciseDiv.appendChild(dataList);
    id += 1;
}

async function addDataListOptions() {
    const dataList = document.createElement("datalist");
    dataList.id = "exercises";
    data.forEach(element => {
        const option = document.createElement("option");
        option.value = element.name;
        dataList.append(option);
    });
    return dataList;
}