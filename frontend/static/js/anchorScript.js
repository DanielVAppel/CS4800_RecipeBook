const recipePageConfig = {
	lastHash: "home",
};

const attachButtonEventListener = () => {
	const button = document.querySelector(".button.previousPage");

	button.addEventListener("click", function (event) {
		handleHashChange(recipePageConfig.lastHash);
	});
};

const anchorEventHandler = (event) => {
	event.preventDefault();

	const mainContainer = document.querySelector(".mainContainer");
	const anchor = event.target.closest('a[data-type="showRecipe"]');

	const {
		dataset: { id },
	} = anchor;

	fetch("/show_recipe?id=" + id)
		.then((response) => response.text())
		.then((data) => {
			const tempContainer = document.createElement("div");
			tempContainer.innerHTML = data;

			const tempMainContainer = tempContainer.querySelector(".mainContainer");
			setDisplay(mainContainer, "block");

			while (mainContainer.firstChild && mainContainer.children.length > 0) {
				mainContainer.removeChild(mainContainer.firstChild);
			}

			tempMainContainer.childNodes.forEach((node) => {
				if (node.nodeType !== Node.TEXT_NODE) {
					mainContainer.appendChild(node);
				}
			});

			window.location.hash = "recipe";
		})
		.finally(attachButtonEventListener);
};

const attachSingleAnchorListener = (anchor) => {
	if (!anchor) return;

	anchor.addEventListener("click", anchorEventHandler);
};

const attachAnchorListeners = () => {
	const anchors = document.querySelectorAll('a[data-type="showRecipe"]');

	anchors.forEach(attachSingleAnchorListener);
};

document.addEventListener("DOMContentLoaded", function () {
	const handleHashChange = () => {
		const { hash } = window.location;

		if (!hash.includes("recipe")) recipePageConfig.lastHash = hash;

		console.log("Changed hash: " + recipePageConfig.lastHash);
	};

	window.addEventListener("hashchange", handleHashChange);
});
