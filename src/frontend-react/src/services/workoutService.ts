import type { Workout, WorkoutViewer } from "../types";
import { fetchWithAuthAsync } from "./api";

export async function loadWorkouts(): Promise<WorkoutViewer[]> {

    let response = await fetchWithAuthAsync("workouts", {
        method: "GET"
    })

    if (!response.ok)
        throw new Error(`Response status: ${response.status}`);

    let data = await response.json();
    return data;
}

export async function loadTemplates(): Promise<WorkoutViewer[]> {

    let response = await fetchWithAuthAsync("workouts/workout-templates", {
        method: "GET"
    })

    if (!response.ok)
        throw new Error(`Response status: ${response.status}`);

    let data = await response.json();
    return data;
}

export async function createWorkout(workout: Workout) {
    let response = await fetchWithAuthAsync("workouts", {
        method: "POST",
        body: JSON.stringify(workout)

    })

    if (!response.ok)
        throw new Error(`Response status: ${response.status}`);
    let data: string = await response.json();
    return data;
}

export async function makeTemplateFromWorkout(workoutId: string): Promise<Workout> {
    let workoutViewer: WorkoutViewer = await loadWorkout(workoutId);

    let workout: Workout = mapWorkoutViewerToWorkout(workoutViewer);

    let response = await fetchWithAuthAsync("workouts/workout-templates/", {
        method: "POST",
        body: JSON.stringify(workout)
    })

    if (!response.ok)
        throw new Error(`Response status: ${response.status}`);
    let data: Workout = await response.json();
    return data;
}

export async function loadWorkout(id: string): Promise<WorkoutViewer> {

    let response = await fetchWithAuthAsync("workouts/" + id, {
        method: "GET"
    })

    if (!response.ok)
        throw new Error(`Response status: ${response.status}`);
    if (response.status === 401) {
    }
    let data = await response.json();
    return data;
}

function mapWorkoutViewerToWorkout(workout: WorkoutViewer): Workout {
    return {
        title: workout.title || "",
        notes: workout.workoutNotes || undefined,
        durationMin: workout.durationMin ?? 1,
        workoutExercises: workout.exercises.map(e => ({
            exerciseId: e.exerciseId,
            orderIndex: e.orderIndex,
            notes: e.exerciseNotes || undefined,
            exerciseSets: e.sets.map(s => ({
                setNumber: s.setNumber,
                reps: s.reps,
                weight: s.weight,
                rpe: s.rpe,
                isWarmup: s.isWarmup
            }))
        }))
    };
}
