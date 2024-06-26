// Handles search page related events
const searchConfig = {
	timing: {
		// transition timings
		inputFocus: 165,
	},
	minimumTimeBetweenUpdates: 600, // delay between recipe list automatic search
	lastUpdateTimestamp: new Date().getTime(),
	hasChanged: false, // whether search input has been modified
};

document.addEventListener("DOMContentLoaded", function () {
	const root = document.documentElement;

	// set dynamic properties (transition timings)
	root.style.setProperty("--input-focus", `${searchConfig.timing.inputFocus}ms`);

	// handle the query search and page updates
	const handleInputSearch = (query) => {
		const resultList = document.querySelector(".resultList");

		// get recipe search results from app.py
		fetch("/search_recipe?query=" + query)
			.then((response) => response.text())
			.then((data) => {
				/**
				 * Temporary element is created to extract necessary data from html.
				 * The mainContainer element is NOT changed when traversing hashes/pages,
				 * we are only replacing the children of mainContainer.
				 */
				const tempContainer = document.createElement("div");
				tempContainer.innerHTML = data;

				const tempResultList = tempContainer.querySelector(".resultList");
				// iterate through recipe search list and add html data
				tempResultList.childNodes.forEach((node) => {
					// Flask custom markup content are considered text nodes
					if (node.nodeType !== Node.TEXT_NODE) {
						const { id, title, cookingtime } = node.dataset;

						// create event listener for "favorite"-ing recipes
						const itemFavorite = tempContainer.querySelector(".itemFavorite");
						itemFavorite.addEventListener("click", function (event) {
							itemFavorite.src = `/static/images/svg/${itemFavorite.src.endsWith("star.svg") ? "star_favorite" : "star"}.svg`;
							console.log(`Favorited Recipe: ${title} | ID: ${id}`);
						});

						// humanize the readyInMinutes data
						// 45 -> 45 min
						const itemRIM = node.querySelector(".itemDetails > .hollowBox > span");
						itemRIM.textContent = reduceMinutes(cookingtime);

						resultList.appendChild(node);
					}
				});
			});
	};

	// handles the update feature based on event listeners
	const handleInputAutoUpdate = (query) => {
		// automatically executes search query every 600ms interval
		setInterval(() => {
			// if no new changes, don't re-execute
			if (!searchConfig.hasChanged) return;

			const now = new Date().getTime(),
				hasBeenLongEnough = calcElapsedTime(searchConfig.lastUpdateTimestamp, now) > searchConfig.minimumTimeBetweenUpdates;

			if (hasBeenLongEnough) {
				searchConfig.hasChanged = false;
				searchConfig.lastUpdateTimestamp = now;

				// handle the query search and page updates
				handleInputSearch(query);
			}
		}, searchConfig.minimumTimeBetweenUpdates);
	};

	const attachSearchRecipeEventListener = () => {
		const recipeSearchInput = document.getElementById("recipeSearch"),
			recipeSearchButton = document.querySelector(".searchBarContainer > .itemImageWrapper");

		const updateSearchConfig = () => {
			searchConfig.hasChanged = true;
			searchConfig.lastUpdateTimestamp = new Date().getTime();
		};

		// execute search query by clicking on search icon
		recipeSearchButton.addEventListener("click", updateSearchConfig);

		// can execute search query by pressing enter
		// NOTE: search is automatically executed every 600ms if
		//       any change has been made to input box
		recipeSearchInput.addEventListener("keydown", function (event) {
			if (event.key == "Enter") updateSearchConfig();
		});

		// prepare search query to automatically be updated
		recipeSearchInput.addEventListener("input", function () {
			// styling changes on query input
			if (recipeSearchInput.value.trim() != "") {
				addClass(recipeSearchInput, "activeQuery", "fontWhite");
				removeClass(recipeSearchInput, "fontGrey");
			} else {
				removeClass(recipeSearchInput, "activeQuery", "fontWhite");
				addClass(recipeSearchInput, "fontGrey");
			}

			updateSearchConfig();
		});

		// handles the update feature based on event listeners
		handleInputAutoUpdate(recipeSearchInput.value);
	};

	const handleHashChange = () => {
		const { hash } = window.location;

		if (hash.includes("search")) attachSearchRecipeEventListener();
	};

	window.addEventListener("hashchange", handleHashChange);
});
