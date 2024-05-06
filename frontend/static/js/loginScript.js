import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js';
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js';
import { getFirestore, doc, setDoc, collection, addDoc, getDoc, } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js';

const firebaseConfig = {
   apiKey: "AIzaSyCDHx8Nf9PVIsSWulOZLnLqUha9zLVExg0",
   authDomain: "recipe-cookbook-ada79.firebaseapp.com",
   projectId: "recipe-cookbook-ada79",
   storageBucket: "recipe-cookbook-ada79.appspot.com",
   messagingSenderId: "307671574733",
   appId: "1:307671574733:web:feeeb24deb74dd299be184",
   measurementId: "G-4FH210WLMQ"
};

const authProvider = new GoogleAuthProvider();

const googleSignIn = async () => {
   try {
      const firebaseApp = initializeApp(firebaseConfig);
      const firebaseAuth = getAuth(firebaseApp);
      firebaseAuth.languageCode = "en";

   } catch (e) {
      console.log(e.code, e.message)
   }
}

document.addEventListener("DOMContentLoaded", function () {
   console.log("loginScript loaded");
   // or however you want to grab the button element
   const attachLoginEventListener = () => {
      console.log("attached event listener to loginButton");
      const loginButton = document.getElementById("loginButton");
      console.log(loginButton);

      // functionality for logging user in when button is clicked
      loginButton.addEventListener("click", function (event) {
         console.log("Login button clicked");
         event.preventDefault();
         firebaseAuth.signInWithPopup(firebaseAuth, authProvider).then((result) => {
            console.log(result);
            const { user } = result;

            const options = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(user),
            };

            // route can be anything, you just have to make one in flask
            // and ensure it matches this url
            fetch("/loggedInUser", options)
               .then((response) => response.text())
               .then((data) => {
               console.log(data);
            });
         });
      });
   }
   const handleHashChange = () => {
   	const { hash } = window.location;

   	if (hash.includes("user")) attachLoginEventListener();
   };

   window.addEventListener("hashchange", handleHashChange);
});