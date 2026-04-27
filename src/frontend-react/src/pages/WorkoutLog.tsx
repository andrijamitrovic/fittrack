import { useEffect, useState } from "react";
import type { Exercise, WorkoutExercise } from "../types";
import { WorkoutExerciseComponent } from "../components/WorkoutExercise";
import { createWorkout, loadWorkout } from "../services/workoutService";
import { loadExercises } from "../services/exerciseService";
import { useNavigate, useParams } from "react-router";

export function WorkoutLog() {
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState("");
    const navigate = useNavigate();
    const { workoutId } = useParams();
    const [title, setTitle] = useState("");
    const [notes, setNotes] = useState("");
    const [exercisesList, setExercisesList] = useState<Exercise[]>([]);
    const [exercises, setExercises] = useState<WorkoutExercise[]>([]);

    function handleChangeTitle(e: React.ChangeEvent<HTMLInputElement>) {
        setTitle(e.target.value);
    }

    function handleChangeNotes(e: React.ChangeEvent<HTMLTextAreaElement>) {
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
            reps: undefined,
            weight: undefined,
            rpe: undefined,
            isWarmup: false
        });
        setExercises(updated);
    }

    function updateSet(exerciseIndex: number, setIndex: number, field: string, value: number | undefined) {
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

    async function saveWorkout() {
        if (exercises.length === 0) {
            setSaveError("Add at least one exercise.");
            return;
        }

        if (exercises.some((exercise) => !exercise.exerciseId)) {
            setSaveError("Pick an exercise for each exercise group.");
            return;
        }

        if (exercises.some((exercise) => exercise.exerciseSets.length === 0)) {
            setSaveError("Add at least one set for each exercise.");
            return;
        }

        setSaving(true);
        setSaveError("");

        try {
            await createWorkout({
                notes: notes || undefined,
                title: title,
                durationMin: 1,
                workoutExercises: exercises
            });
            navigate("/workouts");
        } catch (err: any) {
            setSaveError(err.message || "Failed to save workout");
        } finally {
            setSaving(false);
        }
    }


    useEffect(() => {
        loadExercises()
            .then(setExercisesList)
            .catch(err => console.error(err));

        if (workoutId) {
            loadWorkout(workoutId)
                .then(workout => {
                    setTitle(workout.title || "");
                    setNotes(workout.workoutNotes || "");
                    setExercises(workout.exercises.map(e => ({
                        exerciseId: e.exerciseId,
                        orderIndex: e.orderIndex,
                        exerciseSets: e.sets.map(s => ({
                            setNumber: s.setNumber,
                            reps: s.reps,
                            weight: s.weight,
                            rpe: s.rpe,
                            isWarmup: s.isWarmup
                        }))
                    })));
                })
                .catch(err => console.error(err));
        }
    }, []);

    return (
        <div className="page workout-page">
            <div className="workout-page-header">
                <h1 className="workout-page-title">
                    {workoutId ? "Copy Workout" : "Add Workout"}
                </h1>
                <p className="workout-page-subtitle">
                    Build the session, add sets, then save it to your history.
                </p>
            </div>

            <form className="workout-form" onSubmit={(e) => { e.preventDefault(); saveWorkout(); }}>
                <div className="workout-top-panel">
                    <div className="field">
                        <label>Title:
                            <input required type="text" id="title" name="title" value={title} onChange={handleChangeTitle} />
                        </label>
                    </div>
                    <div className="field">
                        <label htmlFor="notes">Notes:
                            <textarea
                                rows={5}
                                id="notes"
                                name="notes"
                                value={notes}
                                onChange={handleChangeNotes}
                            />
                        </label>
                    </div>
                </div>
                {/* <h2>Duration: </h2>
                <label for="durationHour">Hours:</label>
                <input type="number" min="0" max="10" id="durationHour" name="durationMin">
                <label for="durationMin">Minutes:</label>
                <input type="number" min="0" max="60" id="durationMin" name="durationMin"> */}
                <div className="workout-builder">
                    <div className="workout-builder-header">
                        <h2>Exercises</h2>

                        <button type="button" className="add-btn" onClick={addExercise} >
                            + Add exercise
                        </button>
                    </div>
                    {exercises.length === 0 ? (
                        <div className="workout-empty-state">
                            No exercises added yet.
                        </div>
                    ) : (
                        exercises.map((exercise, index) => (
                            <WorkoutExerciseComponent
                                key={index}
                                exercisesList={exercisesList}
                                exercise={exercise}
                                onAddSet={() => addSet(index)}
                                onUpdateSet={(setIndex: number, field: string, value: number | undefined) => updateSet(index, setIndex, field, value)}
                                onDeleteExercise={() => deleteExercise(index)}
                                onDeleteSet={(setIndex: number) => deleteSet(index, setIndex)}
                                onSelectExercise={(id) => selectExercise(index, id)}
                            />
                        )))}

                </div>

                <div className="workout-form-actions">
                    {saveError && <p className="error-message">{saveError}</p>}
                    <button type="submit" className="save-btn" disabled={saving}>
                        {saving ? "Saving..." : "Save Workout"}
                    </button>
                </div>

            </form>
        </div>

    );
}
