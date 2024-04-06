function searchRecipes() {
    const apiKey = '2d396b8648804505b0228b03a5cc9adf'; // Spoonacular API key
    const searchInput = document.getElementById('searchInput').value;
    const recipeList = document.getElementById('recipeList');

    // Clear previous search results
    recipeList.innerHTML = '';

    // Fetch recipes from Spoonacular API
    fetch(`https://api.spoonacular.com/recipes/search?query=${searchInput}&apiKey=${apiKey}&number=100`)
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
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
}

function displayRecipeDetails(recipeId, listItem) {
    const apiKey = '2d396b8648804505b0228b03a5cc9adf'; // Spoonacular API key

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
                </div>
            `;
            const recipeDetailsContainer = document.createElement('div');
            recipeDetailsContainer.innerHTML = recipeDetailsHTML;
            listItem.appendChild(recipeDetailsContainer); // Append the recipe details container under the clicked recipe item
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
}
