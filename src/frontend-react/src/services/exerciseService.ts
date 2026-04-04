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