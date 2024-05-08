// Handles carousel related events
const carouselConfig = {
	timing: {
		// transition timings
		itemFocus: 350,
		focusMaskDelay: 100,
		heroDelay: 50,
	},
	scrollSpeed: 750, // horizontal distance scroll of mouse
	minimumTimeBetweenScrolls: 600, // delay between scrolls for smooth transition
	lastScrollTimestamp: new Date().getTime(),
};

// creates the "Check Recipe" element underneath selected recommended recipe
const createItemText = (focusedItem) => {
	const itemText = createElWithClass("div", "itemText");

	const anchor = createElWithClass("a");
	anchor.href = focusedItem.dataset.source;

	const span = createElWithClass("span", "fontSubtitle");
	span.textContent = "Check Recipe";

	anchor.appendChild(span);
	itemText.appendChild(anchor);

	return itemText;
};

// convert minutes into hh:mm format
const reduceMinutes = (minutes) => {
	if (minutes < 60) {
		return `${minutes} min`;
	} else {
		const hours = Math.floor(minutes / 60);
		const remainingTime = minutes % 60;

		if (remainingTime === 0) {
			return `${hours} hr`;
		} else {
			return `${hours} hr ${remainingTime} min`;
		}
	}
};

document.addEventListener("DOMContentLoaded", function () {
	var carouselItems = document.querySelectorAll(".carouselItem"),
		heroImage = document.getElementById("heroImage"),
		heroTextWrapper = document.getElementById("heroTextWrapper"),
		heroTitle = document.querySelector(".heroTitle"),
		subsectionServings = document.querySelector(".heroSubsection > .fontSubtitle"),
		// ready in minutes (RIM)
		subsectionRIM = document.querySelector(".heroSubsection > .hollowBox > .fontSubtitle"),
		heroSubtitle = document.querySelector(".heroSubtitle > .fontSubtitle"),
		heroDescription = document.querySelector(".heroDescription");

	const root = document.documentElement;

	const {
		timing: { itemFocus, focusMaskDelay, heroDelay },
		scrollSpeed,
	} = carouselConfig;

	// set dynamic properties (transition timings)
	root.style.setProperty("--item-focus", `${itemFocus}ms`);
	root.style.setProperty("--item-mask", `${itemFocus + focusMaskDelay}ms`);
	root.style.setProperty("--hero-fade", `${itemFocus + heroDelay}ms`);

	// create event listeners for each carousel item
	const attachCarouselEventListeners = () => {
		// re-initialize variables that were previously removed
		carouselItems = document.querySelectorAll(".carouselItem");
		heroImage = document.getElementById("heroImage");
		heroTextWrapper = document.getElementById("heroTextWrapper");
		heroTitle = document.querySelector(".heroTitle");
		subsectionServings = document.querySelector(".heroSubsection > .fontSubtitle");
		// ready in minutes (RIM)
		subsectionRIM = document.querySelector(".heroSubsection > .hollowBox > .fontSubtitle");
		heroSubtitle = document.querySelector(".heroSubtitle > .fontSubtitle");
		heroDescription = document.querySelector(".heroDescription");

		for (let i = 0; i < carouselItems.length; i++) {
			const item = carouselItems[i];

			/**
			 * First click on the recipe in the carousel should bring it to focus,
			 * changing the hero background image and text (big image and text on home page)
			 * The second click then redirects user to the actual recipe page.
			 */
			item.addEventListener("click", function (event) {
				event.stopPropagation();

				const selectedItem = event.target.closest(".selectedItem");

				// if recipe is not "selected", reject href default behavior
				if (!selectedItem) event.preventDefault();
				// otherwise, it will be "selected" and href will be accessable
				if (selectedItem != this) focusItem(item, i == 0);
			});
		}
	};

	// handles user's first click on recipe in carousel
	const focusItem = (focusedItem, recipeOfTheDay) => {
		// ensures only one carousel recipe is selected at a time
		carouselItems.forEach((item) => {
			removeClass(item, "selectedItem");
			const itemText = item.querySelector(".itemText");
			if (itemText) item.removeChild(itemText);

			const anchor = item.querySelector('a[data-type="showRecipe"]');
			anchor.removeEventListener("click", anchorEventHandler);
		});

		const itemText = createItemText(focusedItem);

		addClass(focusedItem, "selectedItem");
		// adds the "Check Recipe" element to selected recipe
		focusedItem.appendChild(itemText);

		const anchor = focusedItem.querySelector('a[data-type="showRecipe"]');
		attachSingleAnchorListener(anchor);

		/**
		 * This part is the transition handler between carousel recipe selections.
		 *
		 * Timings:
		 * hero elements have opacity transition times of 400ms (itemFocus + heroDelay)
		 *
		 * To avoid abrupt changes to text, we "hide" the hero element and then make the appropriate
		 * changes. Then, we "show" the updated hero element based on the selected recipe.
		 */
		heroTextWrapper.style.opacity = 0;
		heroImage.style.opacity = 0;

		setTimeout(() => {
			const { id, title, image, servings, cookingtime, description, cuisines } = focusedItem.dataset;

			heroImage.style.opacity = 1;
			heroImage.style.backgroundImage = `url("${image}")`;

			// change hero text/image according to focused item
			heroTitle.textContent = title;
			subsectionServings.textContent = `${servings} Serving${servings > 1 ? "s" : ""}`;
			subsectionRIM.textContent = reduceMinutes(cookingtime);
			heroSubtitle.textContent = recipeOfTheDay ? "Recipe of the Day" : "Recommended Recipe";
			heroDescription.textContent = description;
		}, itemFocus + heroDelay);

		// nicer transition when text loads in delayed
		setTimeout(() => {
			heroTextWrapper.style.opacity = 1;
		}, itemFocus + heroDelay * 5);
	};

	const attachCarouselScrollListener = () => {
		// handle user scroll in carousel (default scroll does not work)
		const carousel = document.querySelector(".recipeCarousel");
		carousel.addEventListener("mousewheel", function (event) {
			event.preventDefault();

			const now = new Date().getTime(),
				hasBeenLongEnough = calcElapsedTime(carouselConfig.lastScrollTimestamp, now) > carouselConfig.minimumTimeBetweenScrolls;

			// only allow user to scroll once per 600ms
			if (hasBeenLongEnough) {
				carousel.scrollLeft += (event.deltaY > 0 ? 1 : -1) * scrollSpeed;
				carouselConfig.lastScrollTimestamp = now;
			}
		});
	};

	const handleHashChange = () => {
		const { hash } = window.location;

		if (hash.includes("home")) {
			attachCarouselEventListeners();
			attachCarouselScrollListener();
		}
		if (hash.includes("user")) attachCarouselEventListeners();
	};

	window.addEventListener("hashchange", handleHashChange);

	// initial call to set up home page
	(initScript = () => {
		focusItem(carouselItems[0], true);
		attachSingleAnchorListener(carouselItems[0].querySelector('a[data-type="showRecipe"]'));
		attachCarouselScrollListener();
	})();
});
