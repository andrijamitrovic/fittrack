import type { Exercise } from "../types";
import { fetchWithAuthAsync } from "./api";

export async function loadExercises() {

    const response = await fetchWithAuthAsync("exercises", {
        method: "GET"
    })
    if (!response.ok)
        throw new Error(`Response status: ${response.status}`);
    const data: Exercise[] = await response.json();
    return data;
}


export async function addExerciseAsync(exercise: Exercise) {

    const response = await fetchWithAuthAsync("exercises", {
        method: "POST",
        body: JSON.stringify(exercise)
    })
    if (!response.ok)
        throw new Error(`Response status: ${response.status}`);
}


export async function updateExerciseAsync(exercise: Exercise) {

    const response = await fetchWithAuthAsync("exercises/" + exercise.id, {
        method: "PUT",
        body: JSON.stringify({
            name: exercise.name,
            category: exercise.category,
            muscleGroup: exercise.muscleGroup
        })
    })
    if (!response.ok)
        throw new Error(`Response status: ${response.status}`);
}

export async function deleteExerciseAsync(id: string) {
    const response = await fetchWithAuthAsync("exercises/" + id, {
        method: "DELETE"
    })
    if (!response.ok)
        throw new Error(`Response status: ${response.status}`);
}