import { useEffect, useState } from "react";
import type { Exercise, WorkoutExercise } from "../types";
import { WorkoutExerciseComponent } from "../components/WorkoutExercise";
import { createWorkout } from "../services/workoutService";
import { loadExercises } from "../services/exerciseService";

export function WorkoutLog() {
    const [title, setTitle] = useState("");
    const [notes, setNotes] = useState("");
    const [exercisesList, setExercisesList] = useState<Exercise[]>([]);
    const [exercises, setExercises] = useState<WorkoutExercise[]>([]);

    function handleChangeTitle(e: React.ChangeEvent<HTMLInputElement>) {
        setTitle(e.target.value);
    }

    function handleChangeNotes(e: React.ChangeEvent<HTMLInputElement>) {
        setNotes(e.target.value);
    }

    function deleteExercise(exerciseIndex: number) {
        setExercises(exercises.filter((_, i) => i !== exerciseIndex));
    }

    function addExercise() {
        setExercises([...exercises, {
            exerciseId: "",
            orderIndex: exercises.length + 1,
            exerciseSets: []
        }])
    }

    function selectExercise(exerciseIndex: number, exerciseId: string) {
        const updated = [...exercises];
        updated[exerciseIndex].exerciseId = exerciseId;
        setExercises([...updated]);
    }

    function addSet(exerciseIndex: number) {
        const updated = [...exercises];
        updated[exerciseIndex].exerciseSets.push({
            setNumber: updated[exerciseIndex].exerciseSets.length + 1,
            reps: 0,
            weight: 0
        });
        setExercises(updated);
    }

    function updateSet(exerciseIndex: number, setIndex: number, field: string, value: number) {
        const updated = [...exercises]
        updated[exerciseIndex].exerciseSets[setIndex] = {
            ...updated[exerciseIndex].exerciseSets[setIndex],
            [field]:value
        }
        setExercises([...updated]);
    }

    function deleteSet(exerciseIndex: number, setIndex: number) {
        const updated = [...exercises];
        updated[exerciseIndex].exerciseSets = updated[exerciseIndex].exerciseSets.filter((_, i) => i !== setIndex);
        setExercises([...updated]);
    }

    function saveWorkout() {
        createWorkout({
            notes: notes,
            title: title,
            durationMin: 1,
            workoutExercises: exercises
        });
    }

    useEffect(() => {
        loadExercises()
            .then(setExercisesList)
            .catch(err => console.error(err));
    }, []);

    return (
        <>
            <div>
                <h1>Add Workout</h1>
            </div>
            <form className="workout-form">
                <label htmlFor="title">Title:</label>
                <input type="text" id="title" name="title" onChange={handleChangeTitle} />
                <label htmlFor="notes">Notes:</label>
                <input type="text" id="notes" name="notes" onChange={handleChangeNotes} />
                {/* <h2>Duration: </h2>
                <label for="durationHour">Hours:</label>
                <input type="number" min="0" max="10" id="durationHour" name="durationMin">
                <label for="durationMin">Minutes:</label>
                <input type="number" min="0" max="60" id="durationMin" name="durationMin"> */}
                <h2>Add excercise</h2>
                <div id="exercise" className="exercise-div">
                    {exercises.map((exercise, index) => (
                        <WorkoutExerciseComponent
                            key={index}
                            exerciseIndex={index}
                            exercisesList={exercisesList}
                            exercise={exercise}
                            onAddSet={() => addSet(index)}
                            onUpdateSet={(setIndex: number, field: string, value: number) => updateSet(index, setIndex, field, value)}
                            onDeleteExercise={() => deleteExercise(index)}
                            onDeleteSet={(setIndex: number) => deleteSet(index, setIndex)}
                            onSelectExercise={(id) => selectExercise(index, id)}
                        />
                    ))}
                </div>

                <input type="button" value="Add exercise" id="workoutButton" onClick={addExercise} />
                <input type="button" value="Save workout" id="saveWorkout" onClick={saveWorkout} />

            </form>
        </>

    );
}