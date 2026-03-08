import { loadExercises } from "./api.js";

const container = document.getElementsByClassName('container').item(0);
let data = await loadExercises();
addToPage(data);

function addToPage(data){
    data.forEach(item => {
        const card = document.createElement('div');
        card.className = "card";
        const h3 = document.createElement('h3');
        const p = document.createElement('p');
        h3.textContent = item.name;
        p.textContent = item.category;
        card.appendChild(h3);
        card.appendChild(p);
        container.appendChild(card);
    });
}

const search = document.getElementById("exercise-search");
search.addEventListener("input", (event) => {
    let filteredData = data.filter((item) => item.name.toLowerCase().includes(event.target.value.toLowerCase()));
    container.innerHTML = '';
    addToPage(filteredData);
})
