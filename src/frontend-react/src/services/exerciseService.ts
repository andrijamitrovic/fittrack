import type { Exercise } from "../types";
import { authHeaders, failedAuth, url } from "./api";

export async function loadExercises() {
    let response = await fetch(url + "Exercises", {
        method: "GET",
        headers: authHeaders(),
    });
    if(response.status === 401)
    {
        failedAuth();
    }    
    if(!response.ok)
        throw new Error(`Response status: ${response.status}`);
    let data: Exercise = await response.json();
    return data;
}