import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
import { getFirestore, doc, setDoc, collection, addDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

const firebaseConfig = {
	apiKey: "AIzaSyCDHx8Nf9PVIsSWulOZLnLqUha9zLVExg0",
	authDomain: "recipe-cookbook-ada79.firebaseapp.com",
	projectId: "recipe-cookbook-ada79",
	storageBucket: "recipe-cookbook-ada79.appspot.com",
	messagingSenderId: "307671574733",
	appId: "1:307671574733:web:feeeb24deb74dd299be184",
	measurementId: "G-4FH210WLMQ",
};

const authProvider = new GoogleAuthProvider();
const firebaseApp = initializeApp(firebaseConfig);
const firebaseAuth = getAuth(firebaseApp);
firebaseAuth.languageCode = "en";

document.addEventListener("DOMContentLoaded", function () {
	var carouselItems = document.querySelectorAll(".carouselItem");

	const updateUserPage = (url, options = {}) => {
		// route can be anything, you just have to make one in flask
		// and ensure it matches this url
		fetch(url, options)
			.then((response) => response.text())
			.then((data) => {
				const mainContainer = document.querySelector(".mainContainer");

				const tempContainer = document.createElement("div");
				tempContainer.innerHTML = data;

				const tempMainContainer = tempContainer.querySelector(".mainContainer");
				if (window.location.hash.includes("user")) setDisplay(mainContainer, "grid");

				while (mainContainer.firstChild && mainContainer.children.length > 0) {
					mainContainer.removeChild(mainContainer.firstChild);
				}

				tempMainContainer.childNodes.forEach((node) => {
					if (node.nodeType !== Node.TEXT_NODE) {
						mainContainer.appendChild(node);
					}
				});
			})
			.finally(() => {
				attachCarouselEventListeners();
				focusItem(carouselItems[0]);
			});
	};

	const attachCarouselEventListeners = () => {
		// re-initialize variables that were previously removed
		carouselItems = document.querySelectorAll(".carouselItem");

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
	const focusItem = (focusedItem) => {
		// ensures only one carousel recipe is selected at a time
		carouselItems.forEach((item) => {
			removeClass(item, "selectedItem");
			const itemText = item.querySelector(".itemText");
			if (itemText) item.removeChild(itemText);

			const anchor = item.querySelector('a[data-type="showRecipe"]');
			anchor.removeEventListener("click", anchorEventHandler);
		});

		const itemText = createItemText();

		addClass(focusedItem, "selectedItem");
		// adds the "Check Recipe" element to selected recipe
		focusedItem.appendChild(itemText);

		const anchor = focusedItem.querySelector('a[data-type="showRecipe"]');
		attachSingleAnchorListener(anchor);
	};

	// or however you want to grab the button element
	const attachLoginEventListener = () => {
		// temporary solution :D
		setTimeout(() => {
			const loginButton = document.getElementById("loginButton");

			if (!loginButton) return;

			// functionality for logging user in when button is clicked
			loginButton.addEventListener("click", function (event) {
				signInWithPopup(firebaseAuth, authProvider).then((result) => {
					console.log(result);
					const { user } = result;

					const options = {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify(user),
					};

					updateUserPage("/signUserIn?fileName=" + window.location.hash.replace("#", ""), options);
				});
			});
		}, 1000);
	};

	const handleHashChange = () => {
		const { hash } = window.location;

		if (hash.includes("user") || hash.includes("create")) attachLoginEventListener();
		if (hash.includes("user")) {
			setTimeout(() => {
				attachCarouselEventListeners();
				if (carouselItems.length > 0) focusItem(carouselItems[0]);
			}, 1000);
		}
	};

	window.addEventListener("hashchange", handleHashChange);
});
