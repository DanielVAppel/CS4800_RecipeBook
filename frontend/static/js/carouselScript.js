// Handles carousel related events

// helper function
const calcElapsedTime = (start, end) => end - start;

// handle user scrolling in recommended recipes
const carouselConfig = {
	timing: {
		itemFocus: 350,
		focusMaskDelay: 100,
		heroDelay: 50,
	},
	scrollSpeed: 750,
	minimumTimeBetweenScrolls: 600,
	lastScrollTimestamp: new Date().getTime(),
};

// creates the "Check Recipe" text underneath selected recommended recipe
const createItemText = (focusedItem) => {
	const itemText = document.createElement("div");
	itemText.classList.add("itemText");

	const anchor = document.createElement("a");
	anchor.href = focusedItem.dataset.source;

	const span = document.createElement("span");
	span.classList.add("fontSubtitle");
	span.textContent = "Check Recipe";

	anchor.appendChild(span);
	itemText.appendChild(anchor);

	return itemText;
};

const reduceMinutes = (minutes) => {
	console.log(minutes);
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
	// handle user selection in recommended recipes
	const root = document.documentElement,
		carouselItems = document.querySelectorAll(".carouselItem"),
		heroImage = document.getElementById("heroImage"),
		heroTextWrapper = document.getElementById("heroTextWrapper"),
		heroTitle = document.querySelector(".heroTitle"),
		subsectionServings = document.querySelector(".heroSubsection > .fontSubtitle"),
		// ready in minutes (RIM)
		subsectionRIM = document.querySelector(".heroSubsection > .hollowBox > .fontSubtitle"),
		heroSubtitle = document.querySelector(".heroSubtitle > .fontSubtitle"),
		heroDescription = document.querySelector(".heroDescription");

	const {
		timing: { itemFocus, focusMaskDelay, heroDelay },
		scrollSpeed,
	} = carouselConfig;

	// set dynamic properties
	root.style.setProperty("--item-focus", `${itemFocus}ms`);
	root.style.setProperty("--item-mask", `${itemFocus + focusMaskDelay}ms`);
	root.style.setProperty("--hero-fade", `${itemFocus + heroDelay}ms`);

	// create event listeners for each carousel item
	for (let i = 0; i < carouselItems.length; i++) {
		const item = carouselItems[i];

		// remember most recently selected recipe
		item.addEventListener("click", function (event) {
			event.stopPropagation();

			const selectedItem = event.target.closest(".selectedItem");
			// if recipe is not "selected", reject href default behavior
			if (!selectedItem) event.preventDefault();
			// otherwise, it will be "selected" and href will be accessable
			if (selectedItem != this) focusItem(item, i == 0);
		});
	}

	const focusItem = (focusedItem, recipeOfTheDay) => {
		// remove all recipes that are "selected"
		carouselItems.forEach((item) => {
			item.classList.remove("selectedItem");
			const itemText = item.querySelector(".itemText");
			if (itemText) item.removeChild(itemText);
		});

		const itemText = createItemText(focusedItem);

		// "select" the recipe
		focusedItem.classList.add("selectedItem");
		focusedItem.appendChild(itemText);

		// "selection" transition
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

		setTimeout(() => {
			heroTextWrapper.style.opacity = 1;
		}, itemFocus + heroDelay * 5);
	};

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

	(initScript = () => {
		focusItem(carouselItems[0], true); // initial call to set selectedItem
	})();
});
