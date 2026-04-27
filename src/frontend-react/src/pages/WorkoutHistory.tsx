import { useEffect, useState } from "react";
import { loadWorkouts, makeTemplateFromWorkout } from "../services/workoutService";
import type { ExerciseSetViewer, WorkoutExerciseViewer, WorkoutViewer } from "../types";
import { useNavigate } from "react-router";

export function WorkoutHistory() {
    const navigate = useNavigate();
    const [workouts, setWorkouts] = useState<WorkoutViewer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    async function makeTemplate(workoutId: string) {
        await makeTemplateFromWorkout(workoutId);
        navigate("/templates");
    }

    async function copyWorkout(workoutId: string) {
        navigate("/newworkout/" + workoutId);
    }

    useEffect(() => {
        loadWorkouts()
            .then(setWorkouts)
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="page history-page">
                <div className="history-page-header">
                    <h1 className="history-page-title">Workout History</h1>
                    <p className="history-page-subtitle">Completed sessions and saved workout data.</p>
                </div>
            </div>
        );
    }
    if (error) {
        return (
            <div className="page history-page">
                <div className="history-page-header">
                    <h1 className="history-page-title">Workout History</h1>
                    <p className="history-page-subtitle">Completed sessions and saved workout data.</p>
                </div>
            </div>
        );
    }

    if (workouts.length === 0) {
        return (
            <div className="page history-page">
                <div className="history-page-header">
                    <h1 className="history-page-title">Workout History</h1>
                    <p className="history-page-subtitle">Completed sessions and saved workout data.</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="page history-page">
                <div className="history-page-header">
                    <h1 className="history-page-title">Workout History</h1>
                    <p className="history-page-subtitle">Completed sessions and saved workout data.</p>
                </div>

                <div className="history-list">
                    {
                        workouts.map((workout: WorkoutViewer) => {
                            return (
                                <div className="card history-card" key={workout.workoutId}>
                                    <div className="history-card-top">
                                        <div className="history-card-head">
                                            <h3>{workout.title}</h3>
                                            <div className="history-meta">
                                                <span>{workout.date!.split("T")[0]}</span>
                                                <span>
                                                    {workout.exercises.length === 1
                                                        ? `${workout.exercises.length} exercise`
                                                        : `${workout.exercises.length} exercises`}
                                                </span>
                                            </div>
                                            {workout.workoutNotes && (
                                                <p className="history-notes">{workout.workoutNotes}</p>
                                            )}
                                        </div>

                                        <div className="history-actions">
                                            <button type="button" onClick={() => makeTemplate(workout.workoutId)}>
                                                Make template
                                            </button>
                                            <button
                                                type="button"
                                                className="add-btn"
                                                onClick={() => copyWorkout(workout.workoutId)}
                                            >
                                                Copy workout
                                            </button>

                                            <button type="button" className="remove-btn">
                                                Delete
                                            </button>
                                        </div>
                                    </div>

                                    <div className="history-exercise-list">
                                        {workout.exercises.map((exercise: WorkoutExerciseViewer) => {
                                            return (
                                                <details key={exercise.workoutExerciseId}>
                                                    <summary>
                                                        <span>{exercise.exerciseName}</span>
                                                        <span>{exercise.sets.length} sets</span>
                                                    </summary>
                                                    {exercise.sets.map((set: ExerciseSetViewer) => {
                                                        return (
                                                            <div className="set-row" key={set.setNumber}>
                                                                <span className="set-label">Set {set.setNumber}</span>
                                                                <span>{set.reps ?? "-"} reps</span>
                                                                <span>{set.weight ?? "-"} kg</span>
                                                                <span>RPE {set.rpe ?? "-"}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </details>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })
                    }
                </div>
            </div>
        </>
    )
}