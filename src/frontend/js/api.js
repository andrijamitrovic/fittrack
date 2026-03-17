const url = "http://localhost:5212/api/";

export async function loadExercises() {
    try{
        let response = await fetch(url + "Exercise");
        if(!response.ok)
            throw new Error(`Response status: ${response.status}`);
        let data = await response.json();
        return data;
    }
    catch(error){
        throw error;
    }
}

export async function createWorkout(workout) {
    try{
        let response = await fetch(url + "Workout", {
            method: "POST",
            headers: {
                "Content-Type" : "application/json",
            },
            body: JSON.stringify(workout)
        })
        if(!response.ok)
            throw new Error(`Response status: ${response.status}`);
        let data = await response.json();
        console.log(data);
        return data;
    }
    catch(error){
        throw error;
    }
}