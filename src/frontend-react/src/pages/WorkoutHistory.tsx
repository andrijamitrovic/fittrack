import { useEffect, useState } from "react";
import { copyWorkoutFromWorkout, loadWorkouts, makeTemplateFromWorkout } from "../services/workoutService";
import type { ExerciseSetViewer, Workout, WorkoutExerciseViewer, WorkoutViewer } from "../types";
import { useNavigate } from "react-router";

export function WorkoutHistory() {
    const navigate = useNavigate();
    const [workouts, setWorkouts] = useState<WorkoutViewer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    async function makeTemplate(workoutId: string) {
        await makeTemplateFromWorkout(workoutId);
    }

    async function copyWorkout(workoutId: string) {
        let newWorkout: Workout = await copyWorkoutFromWorkout(workoutId);
        navigate("/newworkout/" + newWorkout.id);
    }

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
                            <div className="cardHeader">
                                <h3>{workout.title}</h3>
                                <p>{workout.date!.split("T")[0]}</p>
                                <button type="button" onClick={() => makeTemplate(workout.workoutId)}>Make template</button>
                                <button type="button" onClick={() => copyWorkout(workout.workoutId)}>Copy workout</button>
                            </div>
                            {workout.exercises.map((exercise: WorkoutExerciseViewer) => {
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