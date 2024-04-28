let currentPage = 1;
const recipesPerPage = 10; // Change this value to adjust the number of recipes per page

function searchRecipes() {
    const apiKey = 'cd18acd25a7541a5b2dcf54105ea7828'; // Spoonacular API key
    const searchInput = document.getElementById('searchInput').value;
    const recipeList = document.getElementById('recipeList');

    // Clear previous search results
    recipeList.innerHTML = '';

    // Check if the search input contains ingredients
    const isIngredientsSearch = searchInput.includes(',');

    if (isIngredientsSearch) {
        searchByIngredients(searchInput);
    } else {
        // Construct query string for categories
        let categoryQuery = '';
        if (selectedCategory) {
            categoryQuery = `&diet=${selectedCategory}`;
        }

        // Fetch recipes from Spoonacular API for the current page
        fetch(`https://api.spoonacular.com/recipes/search?query=${searchInput}&apiKey=${apiKey}&number=${recipesPerPage}&offset=${(currentPage - 1) * recipesPerPage}${categoryQuery}`)
            .then(response => response.json())
            .then(data => {
                data.results.forEach(recipe => {
                    const li = document.createElement('li');
                    li.classList.add('recipe-item');
                    const title = document.createElement('span');
                    title.textContent = recipe.title;
                    li.appendChild(title);
                    li.addEventListener('click', () => displayRecipeDetails(recipe.id, li));
                    recipeList.appendChild(li);
                });

                // Display page counter and arrow buttons
                const counter = document.createElement('span');
                counter.textContent = `Page ${currentPage}`;
                recipeList.appendChild(counter);

                const prevButton = document.createElement('button');
                prevButton.innerHTML = '&#9668;'; // Left arrow HTML entity
                prevButton.classList.add('arrow-button', 'prev-button');
                prevButton.addEventListener('click', prevPage);
                recipeList.appendChild(prevButton);

                const nextButton = document.createElement('button');
                nextButton.innerHTML = '&#9658;'; // Right arrow HTML entity
                nextButton.classList.add('arrow-button', 'next-button');
                nextButton.addEventListener('click', nextPage);
                recipeList.appendChild(nextButton);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    }
}

function searchByIngredients(ingredients) {
    const apiKey = 'cd18acd25a7541a5b2dcf54105ea7828'; // Spoonacular API key
    const recipeList = document.getElementById('recipeList');

    // Clear previous search results
    recipeList.innerHTML = '';

    // Fetch recipes from Spoonacular API
    fetch(`https://api.spoonacular.com/recipes/findByIngredients?ingredients=${ingredients}&number=${recipesPerPage}&limitLicense=true&ranking=1&ignorePantry=true&apiKey=${apiKey}`)
        .then(response => response.json())
        .then(data => {
            data.forEach(recipe => {
                const li = document.createElement('li');
                li.classList.add('recipe-item');
                const title = document.createElement('span');
                title.textContent = recipe.title;
                li.appendChild(title);
                li.addEventListener('click', () => displayRecipeDetails(recipe.id, li));
                recipeList.appendChild(li);
            });

            // Display page counter and arrow buttons
            const counter = document.createElement('span');
            counter.textContent = `Page ${currentPage}`;
            recipeList.appendChild(counter);

            const prevButton = document.createElement('button');
            prevButton.innerHTML = '&#9668;'; // Left arrow HTML entity
            prevButton.classList.add('arrow-button', 'prev-button');
            prevButton.addEventListener('click', prevPage);
            recipeList.appendChild(prevButton);

            const nextButton = document.createElement('button');
            nextButton.innerHTML = '&#9658;'; // Right arrow HTML entity
            nextButton.classList.add('arrow-button', 'next-button');
            nextButton.addEventListener('click', nextPage);
            recipeList.appendChild(nextButton);
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
}

function filterByIngredients() {
    const ingredients = document.getElementById('ingredientsInput').value;
    searchByIngredients(ingredients);
}

function nextPage() {
    currentPage++;
    searchRecipes();
}

function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        searchRecipes();
    }
}

let selectedCategory = ''; // Variable to store the selected category

function selectCategory(category) {
    selectedCategory = category;
    currentPage = 1; // Reset page to 1 when category changes
    searchRecipes();
}

function displayRecipeDetails(recipeId, listItem) {
    const apiKey = 'cd18acd25a7541a5b2dcf54105ea7828'; // Spoonacular API key

    // Check if recipe details are already displayed
    const existingDetailsContainer = listItem.querySelector('.recipe-details');
    if (existingDetailsContainer) {
        // If already displayed, remove it and return
        listItem.removeChild(existingDetailsContainer);
        return;
    }

    // Fetch recipe details from Spoonacular API
    fetch(`https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${apiKey}`)
        .then(response => response.json())
        .then(data => {
            const { title, image, readyInMinutes, servings, extendedIngredients, instructions } = data;
            const ingredientsList = extendedIngredients.map(ingredient => `<li>${ingredient.original}</li>`).join('');
            const recipeDetailsHTML = `
                <div class="recipe-details">
                    <h2>${title}</h2>
                    <img src="${image}" alt="${title}">
                    <p>Ready in ${readyInMinutes} minutes | Serves ${servings}</p>
                    <div class="ingredients">
                        <h3>Ingredients</h3>
                        <ul>${ingredientsList}</ul>
                    </div>
                    <div class="instructions">
                        <h3>Instructions</h3>
                        <p>${instructions}</p>
                    </div>
                    <button class="toggle-recipe">Minimize</button>
                    <button class="nutrition-label-button" onclick="displayNutritionLabel(${recipeId}, this.parentElement)">Nutrition Label</button>
                </div>
            `;
            const recipeDetailsContainer = document.createElement('div');
            recipeDetailsContainer.innerHTML = recipeDetailsHTML;
            listItem.appendChild(recipeDetailsContainer); // Append the recipe details container under the clicked recipe item

            // Add event listener to toggle button
            const toggleButton = recipeDetailsContainer.querySelector('.toggle-recipe');
            toggleButton.addEventListener('click', event => {
                event.stopPropagation(); // Prevent click event from reaching the parent element
                listItem.removeChild(recipeDetailsContainer);
            });
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
}

function displayNutritionLabel(recipeId, listItem) {
    const apiKey = 'cd18acd25a7541a5b2dcf54105ea7828'; // Spoonacular API key

    // Fetch nutrition label from Spoonacular API
    fetch(`https://api.spoonacular.com/recipes/${recipeId}/nutritionLabel?apiKey=${apiKey}&defaultCss=true&showOptionalNutrients=false&showZeroValues=false&showIngredients=false`)
        .then(response => response.text()) // Response is HTML, so convert to text
        .then(data => {
            const nutritionLabelContainer = document.createElement('div');
            nutritionLabelContainer.innerHTML = data;
            listItem.appendChild(nutritionLabelContainer); // Append the nutrition label container under the clicked recipe item
        })
        .catch(error => {
            console.error('Error fetching nutrition label:', error);
        });
}

// Call searchRecipes initially
searchRecipes();