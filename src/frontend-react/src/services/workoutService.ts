import type { Workout, WorkoutViewer } from "../types";
import { fetchWithAuthAsync } from "./api";

export async function loadWorkouts(): Promise<WorkoutViewer[]> {

    const response = await fetchWithAuthAsync("workouts", {
        method: "GET"
    })

    if (!response.ok)
        throw new Error(`Response status: ${response.status}`);

    const data = await response.json();
    return data;
}

export async function loadTemplates(): Promise<WorkoutViewer[]> {

    const response = await fetchWithAuthAsync("workouts/workout-templates", {
        method: "GET"
    })

    if (!response.ok)
        throw new Error(`Response status: ${response.status}`);

    const data = await response.json();
    return data;
}

export async function createWorkout(workout: Workout) {
    const response = await fetchWithAuthAsync("workouts", {
        method: "POST",
        body: JSON.stringify(workout)

    })

    if (!response.ok)
        throw new Error(`Response status: ${response.status}`);
    const data: string = await response.json();
    return data;
}

export async function makeTemplateFromWorkout(workoutId: string): Promise<Workout> {
    const workoutViewer: WorkoutViewer = await loadWorkout(workoutId);

    const workout: Workout = mapWorkoutViewerToWorkout(workoutViewer);

    const response = await fetchWithAuthAsync("workouts/workout-templates/", {
        method: "POST",
        body: JSON.stringify(workout)
    })

    if (!response.ok)
        throw new Error(`Response status: ${response.status}`);
    const data: Workout = await response.json();
    return data;
}

export async function loadWorkout(id: string): Promise<WorkoutViewer> {

    const response = await fetchWithAuthAsync("workouts/" + id, {
        method: "GET"
    })

    if (!response.ok)
        throw new Error(`Response status: ${response.status}`);
    if (response.status === 401) {
    }
    const data = await response.json();
    return data;
}

export async function deleteWorkoutAsync(id: string): Promise<void> {
    const response = await fetchWithAuthAsync("workouts/" + id, {
        method: "DELETE"
    })

    if (!response.ok)
        throw new Error(`Response status: ${response.status}`);
}

export async function deleteTemplateAsync(id: string): Promise<void> {
    const response = await fetchWithAuthAsync("workouts/workout-templates/" + id, {
        method: "DELETE"
    })

    if (!response.ok)
        throw new Error(`Response status: ${response.status}`);
}

export async function updateWorkoutAsync(workoutViewer: WorkoutViewer, id: string): Promise<void> {
    const workout: Workout = mapWorkoutViewerToWorkout(workoutViewer);

    const response = await fetchWithAuthAsync("workouts/" + id, {
        method: "PUT",
        body: JSON.stringify(workout)
    })

    if (!response.ok)
        throw new Error(`Response status: ${response.status}`);
}

export async function updateTemplateAsync(workoutViewer: WorkoutViewer, id: string): Promise<void> {
    const workout: Workout = mapWorkoutViewerToWorkout(workoutViewer);
    
    const response = await fetchWithAuthAsync("workouts/workout-templates/" + id, {
        method: "PUT",
        body: JSON.stringify(workout)
    })

    if (!response.ok)
        throw new Error(`Response status: ${response.status}`);
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
