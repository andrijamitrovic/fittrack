const url = "http://localhost:5212/api/Exercise";

export async function loadExercises() {
    try{
        let response = await fetch(url);
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