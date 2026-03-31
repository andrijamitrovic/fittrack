import type { Workout, WorkoutViewer } from "../types";
import { authHeaders, failedAuth, url } from "./api";

export async function loadWorkouts(): Promise<WorkoutViewer[]> {
    let response = await fetch(url + "Workouts", {
        method: "GET",
        headers: authHeaders(),
    });
    if (response.status === 401) {
        failedAuth();
    }
    if (!response.ok)
        throw new Error(`Response status: ${response.status}`);
    if (response.status === 401) {
    }
    let data = await response.json();
    return data;
}

export async function createWorkout(workout: Workout) {
    let response = await fetch(url + "Workouts", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(workout)
    })
    if (response.status === 401) {
        failedAuth();
    }
    if (!response.ok)
        throw new Error(`Response status: ${response.status}`);
    let data: string = await response.json();
    return data;
}