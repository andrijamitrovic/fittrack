import { useEffect, useState } from "react";
import type { Exercise, WorkoutExercise } from "../types";
import { WorkoutExerciseComponent } from "../components/WorkoutExercise";
import { createWorkout, loadWorkout } from "../services/workoutService";
import { loadExercises } from "../services/exerciseService";
import { useParams } from "react-router";

export function WorkoutLog() {
    const { workoutId } = useParams();
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
            weight: 0,
            rpe: 0,
            isWarmup: false
        });
        setExercises(updated);
    }

    function updateSet(exerciseIndex: number, setIndex: number, field: string, value: number) {
        const updated = [...exercises]
        updated[exerciseIndex].exerciseSets[setIndex] = {
            ...updated[exerciseIndex].exerciseSets[setIndex],
            [field]: value
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

        if (workoutId) {
            loadWorkout(workoutId)
                .then(workout => {
                    setTitle(workout.title || "");
                    setNotes(workout.notes || "");
                    setExercises(workout.exercises.map(e => ({
                        exerciseId: e.exerciseId,
                        orderIndex: e.orderIndex,
                        exerciseSets: e.sets.map(s => ({
                            setNumber: s.setNumber,
                            reps: s.reps || 0,
                            weight: s.weight || 0,
                            rpe: s.rpe,
                            isWarmup: s.isWarmup
                        }))
                    })));
                })
                .catch(err => console.error(err));
        }
    }, []);

    return (
        <div className="page">
            <h1 className="title">Add Workout</h1>
            <form className="workout-form">
                <div className="field">
                    <label>Title:
                        <input type="text" id="title" name="title" onChange={handleChangeTitle} />
                    </label>
                </div>
                <div className="field">
                    <label htmlFor="notes">Notes:
                        <input type="text" id="notes" name="notes" onChange={handleChangeNotes} />
                    </label>
                </div>
                {/* <h2>Duration: </h2>
                <label for="durationHour">Hours:</label>
                <input type="number" min="0" max="10" id="durationHour" name="durationMin">
                <label for="durationMin">Minutes:</label>
                <input type="number" min="0" max="60" id="durationMin" name="durationMin"> */}
                <div className="section">
                    <h2>Add excercises</h2>
                    {exercises.map((exercise, index) => (
                        <WorkoutExerciseComponent
                            key={index}
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

                <button type="button" className="add-btn" onClick={addExercise} > + Add exercise </button>
                <button type="button" className="save-btn" onClick={saveWorkout} > Save Workout </button>

            </form>
        </div>

    );
}