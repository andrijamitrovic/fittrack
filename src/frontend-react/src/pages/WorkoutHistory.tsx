import { useEffect, useState } from "react";
import { loadWorkouts } from "../services/workoutService";
import type { ExerciseSetViewer, WorkoutExerciseViewer, WorkoutViewer } from "../types";

export function WorkoutHistory() {
    const [workouts, setWorkouts] = useState<WorkoutViewer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadWorkouts()
            .then(setWorkouts)
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <p>Loading...</p>
    if (error) return <p>{error}</p>

    return (
        <>
            {
                workouts.map((workout: WorkoutViewer) => {
                    return (
                        <div className="card" key={workout.workoutId}>
                            <h3>{workout.title}</h3>
                            <p>{workout.date!.split("T")[0]}</p>
                            {workout.workoutExercises.map((exercise: WorkoutExerciseViewer) => {
                                return (
                                    <details key={exercise.workoutExerciseId}>
                                        <summary>
                                            {exercise.exerciseName} - {exercise.sets.length} sets
                                        </summary>
                                        {exercise.sets.map((set: ExerciseSetViewer) => {
                                            return (
                                                <div className="set-row" key={set.setNumber}>
                                                    Set {set.setNumber}: {set.reps} reps x {set.weight}kg @ RPE {set.rpe}
                                                </div>
                                            );
                                        })}
                                    </details>
                                );
                            })}
                        </div>
                    );
                })
            }
        </>
    )
}