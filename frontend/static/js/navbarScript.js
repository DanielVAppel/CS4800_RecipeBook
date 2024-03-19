const selectionIndicator = {
	height: 78, // px
	padding: 1, // rem
	selectedItemIndex: 1, //
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
	const resize = () => {
		const navbarItem = navbarItems[0];
		selectionIndicator.height = navbarItem.clientHeight;
		selectionIndicator.padding = navbarItem.clientHeight >= 94 ? 1.5 : 1;

		updateSelectionIndicator(selectionIndicator.selectedItemIndex);
	};

	window.onresize = resize;

	for (let i = 0; i < navbarItems.length; i++) {
		const item = navbarItems[i];

		item.addEventListener("click", function () {
			focusItem(this);

			selectionIndicator.selectedItemIndex = i;
			updateSelectionIndicator(i);
		});
	}

	const focusItem = (focusedItem) => {
		navbarItems.forEach((item) => {
			item.classList.remove("selectedItem");
		});

		focusedItem.classList.add("selectedItem");
	};

	(initScript = () => {
		resize(); // initial call to set values
	})();
});
