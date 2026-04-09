import { useEffect, useState } from "react";
import { copyWorkoutFromWorkout, loadTemplates, loadWorkouts } from "../services/workoutService";
import type { Workout, WorkoutExerciseViewer, WorkoutViewer } from "../types";
import { useNavigate } from "react-router";

export function Templates() {
    const navigate = useNavigate();
    const [workouts, setWorkouts] = useState<WorkoutViewer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    async function makeWorkout(workoutId: string) {
        let newWorkout: Workout = await copyWorkoutFromWorkout(workoutId);
        navigate("/newworkout/" + newWorkout.id);
    }

    useEffect(() => {
        loadTemplates()
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
                                <button type="button" onClick={() => makeWorkout(workout.workoutId)}>Use template</button>
                            </div>
                            {workout.exercises.map((exercise: WorkoutExerciseViewer) => {
                                console.log(workout)
                                return (
                                    <div key={exercise.workoutExerciseId}>
                                        {exercise.exerciseName} - {exercise.sets.length} sets
                                    </div>
                                );
                            })}
                        </div>
                    );
                })
            }
        </>
    )
}