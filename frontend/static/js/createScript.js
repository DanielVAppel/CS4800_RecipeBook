
document.addEventListener("DOMContentLoaded", function () {
   const updateCreatePage = (url, options = {}) => {
      // route can be anything, you just have to make one in flask
      // and ensure it matches this url
      fetch(url, options)
         .then((response) => response.text())
         .then((data) => {
            console.log(data);

            const mainContainer = document.querySelector(".mainContainer");

            const tempContainer = document.createElement("div");
            tempContainer.innerHTML = data;

            const tempMainContainer = tempContainer.querySelector(".mainContainer");

            while (mainContainer.firstChild && mainContainer.children.length > 0) {
               mainContainer.removeChild(mainContainer.firstChild);
            }

            tempMainContainer.childNodes.forEach((node) => {
               if (node.nodeType !== Node.TEXT_NODE) {
                  mainContainer.appendChild(node);
               }
            });
         });
   };

	const attachCreateEventListener = () => {
      const recipeNameInput = document.getElementById("recipeName");
      const recipeServingsInput = document.getElementById("recipeServings");
      const recipeTimeInput = document.getElementById("recipeTime");
      const recipeIngredientsInput = document.getElementById("recipeIngredients");
      const recipeEquipmentInput = document.getElementById("recipeEquipment");
      const recipeInstructionsInput = document.getElementById("recipeInstructions");
		const submitButton = document.getElementById("submitButton");


		submitButton.addEventListener("click", function (event) {
         
         const recipe = {
            name: recipeNameInput.value,
            servings: recipeServingsInput.value,
            time: recipeTimeInput.value,
            ingredients: recipeIngredientsInput.value,
            equipment: recipeEquipmentInput.value,
            instructions: recipeInstructionsInput.value,
         };

         console.log(recipe);

         const options = {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
            },
            body: JSON.stringify(recipe),
         };

         updateCreatePage("/createRecipe", options);
         alert("Recipe Created");
		});
	};

	const handleHashChange = () => {
		const { hash } = window.location;

		if (hash.includes("create")) attachCreateEventListener();
	};

	window.addEventListener("hashchange", handleHashChange);
});