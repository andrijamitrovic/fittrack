import { useEffect, useState } from "react";
import { loadTemplates } from "../services/workoutService";
import type { ExerciseSetViewer, WorkoutExerciseViewer, WorkoutViewer } from "../types";
import { useNavigate } from "react-router";

export function Templates() {
    const navigate = useNavigate();
    const [workouts, setWorkouts] = useState<WorkoutViewer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    function makeWorkout(workoutId: string) {
        navigate("/newworkout/" + workoutId);
    }

    useEffect(() => {
        loadTemplates()
            .then(setWorkouts)
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="page history-page">
                <div className="history-page-header">
                    <h1 className="history-page-title">Templates</h1>
                    <p className="history-page-subtitle">Reusable workout structures for fast planning.</p>
                </div>
                <p className="history-status">Loading...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page history-page">
                <div className="history-page-header">
                    <h1 className="history-page-title">Templates</h1>
                    <p className="history-page-subtitle">Reusable workout structures for fast planning.</p>
                </div>
                <p className="history-status">{error}</p>
            </div>
        );
    }

    if (workouts.length === 0) {
        return (
            <div className="page history-page">
                <div className="history-page-header">
                    <h1 className="history-page-title">Templates</h1>
                    <p className="history-page-subtitle">Reusable workout structures for fast planning.</p>
                </div>
                <p className="history-status">No templates yet.</p>
            </div>
        );
    }

    return (
        <div className="page history-page">
            <div className="history-page-header">
                <h1 className="history-page-title">Templates</h1>
                <p className="history-page-subtitle">Reusable workout structures for fast planning.</p>
            </div>

            <div className="history-list">
                {workouts.map((workout: WorkoutViewer) => (
                    <div className="card history-card" key={workout.workoutId}>
                        <div className="history-card-top">
                            <div className="history-card-head">
                                <h3>{workout.title}</h3>
                                <div className="history-meta">
                                    <span>
                                        {workout.exercises.length === 1
                                            ? `${workout.exercises.length} exercise`
                                            : `${workout.exercises.length} exercises`}
                                    </span>
                                    {workout.durationMin && <span>{workout.durationMin} min</span>}
                                </div>
                                {workout.workoutNotes && (
                                    <p className="history-notes">{workout.workoutNotes}</p>
                                )}
                            </div>

                            <div className="history-actions">
                                <button
                                    type="button"
                                    onClick={() => makeWorkout(workout.workoutId)}
                                >
                                    Use template
                                </button>
                            </div>
                        </div>

                        <div className="history-exercise-list">
                            {workout.exercises.map((exercise: WorkoutExerciseViewer) => (
                                <details key={exercise.workoutExerciseId}>
                                    <summary>
                                        <span>{exercise.exerciseName}</span>
                                        <span>{exercise.sets.length} sets</span>
                                    </summary>

                                    {exercise.sets.map((set: ExerciseSetViewer) => (
                                        <div className="set-row" key={set.setNumber}>
                                            <span className="set-label">Set {set.setNumber}</span>
                                            <span>{set.reps ?? "-"} reps</span>
                                            <span>{set.weight ?? "-"} kg</span>
                                            <span>RPE {set.rpe ?? "-"}</span>
                                        </div>
                                    ))}
                                </details>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
