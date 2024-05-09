// Handles navigation tab related events
const selectionIndicator = {
	// "hard coded-ish" values for navigation tab
	height: 78, // px
	padding: 1, // rem
	selectedItemIndex: 1, // index tracker to prevent updates when clicking on "selected" tab
};

// reference for navigation bar selection indicator
const navigationIndex = {
	"#search": 0,
	"#home": 1,
	"#create": 2,
	"#user": 3,
};

/**
 * Ensure all contents inside mainContainer are loaded and configured properly. Elements
 * are removed and re-added when visiting different pages so event listeners have to be
 * re-added (examples in carouselScript.js and recipeSearchScript.js).
 *
 * ALL CONTENT MUST BE PLACED INSIDE div.mainContainer.
 * Check how base.html and home.html are configured.
 */
const handlePageChange = (path, callback = function () {}) => {
	const mainContainer = document.querySelector(".mainContainer");

	fetch("/" + path)
		.then((response) => response.text())
		.then((data) => {
			const tempContainer = document.createElement("div");
			tempContainer.innerHTML = data;

			switch (path.replace("#", "").trim()) {
				case "search":
				case "recipe":
					setDisplay(mainContainer, "block");
					break;
				case "home":
					setDisplay(mainContainer, "grid");

					const heroTextWrapper = tempContainer.querySelector("#heroTextWrapper");
					toggleOpacity(heroTextWrapper, 1);

					const carouselItems = tempContainer.querySelectorAll(".carouselItem"),
						focusedItem = carouselItems[0];
					const itemText = createItemText(focusedItem);

						addClass(focusedItem, "selectedItem");
						focusedItem.appendChild(itemText);
						break;
					case "create":
						setDisplay(mainContainer, "block");
						break;
					case "user":
						const exampleElement = tempContainer.querySelector(".carouselItem");
						if (exampleElement != null) {
							setDisplay(mainContainer, "grid");
							mainContainer.style.gridTemplateRows = "1fr 1fr";
							const favoriteItems = tempContainer.querySelectorAll(".carouselItem"),
								focusedFavoriteItem = favoriteItems[0];

							const favoriteItemText = createItemText(focusedFavoriteItem);
							addClass(focusedFavoriteItem, "selectedItem");
							focusedFavoriteItem.appendChild(favoriteItemText);
						} else {
							setDisplay(mainContainer, "block");
						}

						break;
					default:
						return;
				}

			const tempMainContainer = tempContainer.querySelector(".mainContainer");

			while (mainContainer.firstChild && mainContainer.children.length > 0) {
				mainContainer.removeChild(mainContainer.firstChild);
			}

			tempMainContainer.childNodes.forEach((node) => {
				if (node.nodeType !== Node.TEXT_NODE) {
					mainContainer.appendChild(node);
				}
			});
		})
		.finally(callback);
};

// this makes sure the correct page is loaded based on navigation tab selection
const handleHashChange = (path) => {
	const mainContainer = document.querySelector(".mainContainer");
	// path is given as #hash, removing it makes it easier to work with
	path = path.replace("#", "").trim();

	/**
	 * For smooth fading transition between pages, we only replace the content inside
	 * of mainContainer. we "hide" the mainContainer, then change the contents of the page
	 * and afterwards change the hash/path and "show" the mainContainer.
	 *
	 * the timing is configured below with the two setTimeouts.
	 */
	toggleOpacity(mainContainer, 0);

	setTimeout(() => {
		handlePageChange(path);

		setTimeout(() => {
			window.location.hash = path;
			toggleOpacity(mainContainer, 1);
		}, carouselConfig.timing.heroDelay);
	}, carouselConfig.timing.itemFocus);
};

document.addEventListener("DOMContentLoaded", function () {
	const navbarItems = document.querySelectorAll(".navItem"),
		navbarSelectionIndicator = document.getElementById("navSelectionIndicator");

	// update placement of red navbar selection indicator
	const updateSelectionIndicator = (index) => {
		const { height, padding } = selectionIndicator;
		navbarSelectionIndicator.style.transform = `translateY(calc(${index * height}px + ${padding}rem))`;
	};

	// update selection indicator values based on window size
	const handleResize = () => {
		const navbarItem = navbarItems[0];
		selectionIndicator.height = navbarItem.clientHeight;
		selectionIndicator.padding = navbarItem.clientHeight >= 94 ? 1.5 : 1;

		updateSelectionIndicator(selectionIndicator.selectedItemIndex);
	};

	// override default function to properly resize navigation
	// tab components when window size changes
	window.onresize = handleResize;

	// ensures only one navigation tab is selected at a time
	const focusItem = (focusedItem) => {
		navbarItems.forEach((item) => {
			removeClass(item, "selectedItem");
		});

		addClass(focusedItem, "selectedItem");
	};

	// create event listeners for each navigation tab
	for (let i = 0; i < navbarItems.length; i++) {
		const item = navbarItems[i];

		item.addEventListener("click", function () {
			// do nothing if user selects currently selected navigation tab
			// aka selecting search page while on search page
			if (selectionIndicator.selectedItemIndex == i) return;

			// see #focusItem
			focusItem(this);

			// updates the current selected navigation tab
			// also adjusts position of red slider
			updateSelectionIndicator((selectionIndicator.selectedItemIndex = i));

			// updates the page based on current selected navigation tab
			handleHashChange(this.dataset.tab);
		});
	}

	(initScript = () => {
		// initial call to return to home page on load/refresh
		window.location.hash = "#home";
		handleResize();
		// navbarItems[0].click();
	})();
});
