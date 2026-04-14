import type { Exercise } from "../types";
import { fetchWithAuthAsync } from "./api";

export async function loadExercises() {

    let response = await fetchWithAuthAsync("exercises", {
        method: "GET"
    })
    if (!response.ok)
        throw new Error(`Response status: ${response.status}`);
    let data: Exercise[] = await response.json();
    return data;
}


export async function addExerciseAsync(exercise: Exercise) {

    let response = await fetchWithAuthAsync("exercises", {
        method: "POST",
        body: JSON.stringify(exercise)
    })
    if (!response.ok)
        throw new Error(`Response status: ${response.status}`);
}