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

    let response = await fetchWithAuthAsync("workouts/from-workout" + workoutId + "/as-template", {
        method: "POST"
    })

    if (!response.ok)
        throw new Error(`Response status: ${response.status}`);
    let data: Workout = await response.json();
    return data;
}


export async function copyWorkoutFromWorkout(workoutId: string): Promise<Workout> {

    let response = await fetchWithAuthAsync("workouts/from-workout/" + workoutId + "/as-template", {
        method: "POST"
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
