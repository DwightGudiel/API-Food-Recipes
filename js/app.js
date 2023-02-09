import {foodRecipes} from "./foodRecipes.js";

document.addEventListener('DOMContentLoaded',()=>{
    foodRecipes();
    footer();
});

// Obtener el año para el copyright
function footer(){
    const year = new Date().getFullYear();
    document.querySelector('#copyright-year').textContent = year
}