import { alert } from "./alerts.js";

export function foodRecipes() {
  /* ======================= SELECTORES =========================*/
  const selectFoodRecipes = document.querySelector("#select-foodRecipes");
  const containerResult = document.querySelector("#result");
  const modal = new bootstrap.Modal(document.querySelector("#modal"), {});
  const containerFavorite = document.querySelector(".favorite");

  // Comprobar si el selector existe
  if (selectFoodRecipes) {
    // Evento
    selectFoodRecipes.addEventListener("change", getSelected);
    // Obtener categorías de la API
    getFoodRecipesCategories();
  }

  // Comprobar si el selector existe
  if (containerFavorite) {
    // Mostrar recetas favoritas en el DOM
    showFoodRecipesfavorites();
  }

  /*========================== FUNCIONES ======================*/

  // Obtener categorías de la API
  function getFoodRecipesCategories() {
    const url = "https://www.themealdb.com/api/json/v1/1/categories.php";

    fetch(url)
      .then((response) => response.json())
      .then((data) => fillSelectFoodRecipes(data.categories))
      .catch((error) => console.log(error));
  }

  // Llenar el selector del formulario con las categorías obtenidas de la API
  function fillSelectFoodRecipes(categories) {
    categories.forEach((category) => {
      const option = document.createElement("option");

      const { strCategory } = category;
      option.textContent = strCategory;

      selectFoodRecipes.appendChild(option);
    });
  }

  // Obtener el valor de la categoria seleccionada por el usuario
  function getSelected(e) {
    getRecipesByCategory(e.target.value);
  }

  // Obtener recetas filtradas por categoria de la API
  function getRecipesByCategory(category) {
    const url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`;

    fetch(url)
      .then((response) => response.json())
      .then((data) => showFoodRecipes(data.meals))
      .catch((error) => console.log(error));
  }

  // Mostrar recetas en el DOM
  function showFoodRecipes(foodRecipes = []) {
    // Limpiar HTML previo
    cleanHTML(containerResult);

    // Recorrer el areglo
    foodRecipes.forEach((foodRecipe) => {
      // Destructuring
      const { idMeal, strMeal, strMealThumb } = foodRecipe;

      // Crear HTML
      const card = document.createElement("div");
      card.classList.add("card", "border-dark");

      const img = document.createElement("img");
      img.classList.add("card-img-top");
      img.src = strMealThumb ?? foodRecipe.image;
      img.alt = `imagen de la receta ${strMeal}}`;

      const cardBody = document.createElement("div");
      cardBody.classList.add("card-body");

      const nameFoodRecipe = document.createElement("h5");
      nameFoodRecipe.classList.add("card-title");
      nameFoodRecipe.textContent = strMeal ?? foodRecipe.title;

      const buttonViewRecipe = document.createElement("a");
      buttonViewRecipe.className = "btn btn-primary w-100 mt-2";
      buttonViewRecipe.innerHTML = `<i class="bi bi-info-circle"></i> Ver Receta`;
      buttonViewRecipe.href = "#";

      // Evento
      buttonViewRecipe.onclick = (e) => {
        e.preventDefault();
        // Mostrar más información de la receta en un modal

        /* Utilizando el operador de coalescencia nullish para comprobar si idMeal es null o indefinido. Si lo es usará foodRecipe.id en su lugar.
        
        foodRecipe.id es del areglo de objetos guardado en el local storage
        */
        moreInformationFoodRecipe(idMeal ?? foodRecipe.id);
      };

      // Añadir al DOM
      card.appendChild(img);
      cardBody.appendChild(nameFoodRecipe);
      cardBody.appendChild(buttonViewRecipe);
      card.appendChild(cardBody);
      containerResult.appendChild(card);
    });
  }

  // Consultar más información sobre las recetas a la API
  function moreInformationFoodRecipe(id) {
    const url = `https://themealdb.com/api/json/v1/1/lookup.php?i=${id}`;

    fetch(url)
      .then((response) => response.json())
      .then((data) => showMoreInformationFoodRecipe(data.meals[0]))
      .catch((error) => console.log(error));
  }

  // Mostrar más información de la receta en un modal
  function showMoreInformationFoodRecipe(foodRecipeObj) {
    // selectores
    const modalBody = document.querySelector(".modal .modal-body");
    const modalTitle = document.querySelector(".modal .modal-title");
    const modalFooter = document.querySelector(".modal-footer");

    // Destructuring
    const { strInstructions, strMeal, idMeal, strMealThumb } = foodRecipeObj;

    // Crear HTML
    modalTitle.textContent = strMeal;

    modalBody.innerHTML = `
    <img src="${strMealThumb}" class="img-fluid" alt="imagenes de la receta ${strMealThumb}">
    <h3 class="text-center my-3">Instrucciones</h3>   
    <p>${strInstructions}</p>
    <h3 class="text-center my-2">Ingredientes y Cantidades</h3>   
    `;

    const ingredientList = document.createElement("ul");
    ingredientList.classList.add("list-group");

    // Obtener los ingredientes de la receta
    for (let i = 1; i <= 20; i++) {
      // Obtener valores que no sean nulos
      if (foodRecipeObj[`strIngredient${i}`]) {
        // ingrediente
        const ingredient = foodRecipeObj[`strIngredient${i}`];
        // medida
        const measure = foodRecipeObj[`strMeasure${i}`];

        // Crear HTML
        const li = document.createElement("li");
        li.classList.add("list-group-item");
        li.textContent = `${ingredient} - ${measure}`;

        // Añadir al DOM
        ingredientList.appendChild(li);
      }
    }

    // Limpiar HTML previo
    cleanHTML(modalFooter);

    const buttonFavorite = document.createElement("button");
    buttonFavorite.classList.add("btn", "w-100", "btn-primary");
    buttonFavorite.textContent = "Guardar en favoritos";

    // Evento
    buttonFavorite.onclick = () => {
      // Validar si la receta existe en el local storage
      if (existFoodRecipeInLocalStorage(idMeal)) {
        buttonFavorite.disabled = true;
        // Mostrar alerta
        alert("La receta ya fue añadida a favoritos", "error");
        return;
      }

      // Guardar la receta favorita en el local storage
      addFoodRecipeFavoriteLocalStorage({
        id: idMeal,
        image: strMealThumb,
        title: strMeal,
      });

      // Mostrar alerta
      alert("Receta añadida a favoritos", "success");
    };

    const buttonDelete = document.createElement("button");
    buttonDelete.classList.add("btn", "w-100", "btn-danger");
    buttonDelete.textContent = "Quitar de favoritos";

    buttonDelete.onclick = () => {
      // Eliminar receta
      deleteFoodRecipeInLocalStorage(idMeal);

      buttonFavorite.disabled = false;

      // mostrar alerta
      alert("Receta eliminada de favoritos", "error");
    };

    const buttonClose = document.createElement("button");
    buttonClose.classList.add("btn", "btn-dark", "w-100");
    buttonClose.innerHTML = `<i class="bi bi-x-lg"></i> Cerrar`;

    // Cerrar el modal
    buttonClose.onclick = () => modal.hide();

    // Añadir al DOM
    modalFooter.appendChild(buttonFavorite);
    modalFooter.appendChild(buttonDelete);
    modalFooter.appendChild(buttonClose);
    modalBody.appendChild(ingredientList);

    // Mostrar el modal
    modal.show();
  }

  // Guardar receta favorita en el local Storage
  function addFoodRecipeFavoriteLocalStorage(foodRecipeObj) {
    const foodRecipesfavorites =
      JSON.parse(localStorage.getItem("foodRecipe")) ?? [];

    localStorage.setItem(
      "foodRecipe",
      JSON.stringify([...foodRecipesfavorites, foodRecipeObj])
    );
  }

  // Comprobar si una receta ya está añadida en el Local Storage
  function existFoodRecipeInLocalStorage(id) {
    const favorites = JSON.parse(localStorage.getItem("foodRecipe")) ?? [];

    // Compruebe si hay una receta similar en el Local Storage.
    const existFoodRecipefavorite = favorites.some(
      (favorite) => favorite.id === id
    );

    // True or false
    return existFoodRecipefavorite;
  }

  // Eliminar receta favorita del Local Storage
  function deleteFoodRecipeInLocalStorage(id) {
    const favorites = JSON.parse(localStorage.getItem("foodRecipe")) ?? [];

    /* Filtra el array de favoritos y devuelve un nuevo array con los favoritos que no tienen el mismo id que el pasado como parámetro.*/
    const foodRecipesFavorites = favorites.filter(
      (favorite) => favorite.id !== id
    );

    // Actualizar Local Storage
    localStorage.setItem("foodRecipe", JSON.stringify(foodRecipesFavorites));
  }

  // Mostrar las recetas favoritas en el DOM
  function showFoodRecipesfavorites() {
    const favorites = JSON.parse(localStorage.getItem("foodRecipe")) ?? [];

    /* Comprueba si hay favoritos en el almacenamiento local. Si los hay, los mostrará. */

    if (favorites.length) {
      showFoodRecipes(favorites);
      return;
    }
  }

  // Limpiar HTML previo
  function cleanHTML(container) {
    /* Removing the previous HTML. */
    while (container.firstChild) {
      /* Removing the first child of the container element. */
      container.removeChild(container.firstChild);
    }
  }
}
