// general helper functions 
// 
const calcElapsedTime = (start, end) => end - start;

// creates elements with specified class names
const createElWithClass = (tagName, ...tokens) => {
    const el = document.createElement(tagName);
    addClass(el, ...tokens);
    return el;
}

// add classes to specified element
const addClass = (el, ...tokens) => {
	tokens.forEach(t => el.classList.add(t));
}

// remove classes from specified element
const removeClass = (el, ...tokens) => {
	tokens.forEach(t => el.classList.remove(t));
}

// changes the display style of element
const setDisplay = (el, display = "block") => {
    el.style.display = display;
}

/**
 * toggles visibility + opacity with specific timings for smooth transitions
 * between pages
 * 
 * opacity change to "hide/show" page
 * visibility change to prevent users from clicking on "hidden" page
 */
const toggleOpacity = (el, opacity = 1) => {
	if (!el) return;

	if (opacity === 0) {
		setTimeout(() => {
			el.style.visibility = "hidden";
		}, carouselConfig.timing.itemFocus + carouselConfig.timing.heroDelay);
	} else {
		el.style.visibility = "visible";
	}

	el.style.opacity = +opacity;
};