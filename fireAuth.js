
// import { initializeApp } from 'firebase/app';
// import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.esm.min.mjs";
// // import { getAnalytics } from "firebase/analytics";

import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js';
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js';


const firebaseConfig = {
  apiKey: "AIzaSyCDHx8Nf9PVIsSWulOZLnLqUha9zLVExg0",
  authDomain: "recipe-cookbook-ada79.firebaseapp.com",
  projectId: "recipe-cookbook-ada79",
  storageBucket: "recipe-cookbook-ada79.appspot.com",
  messagingSenderId: "307671574733",
  appId: "1:307671574733:web:feeeb24deb74dd299be184",
  measurementId: "G-4FH210WLMQ"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
auth.languageCode = 'en';
const provider = new GoogleAuthProvider();

const googleLogin = document.getElementById("google-login-btn");
googleLogin.addEventListener("click",function(){
  signInWithPopup(auth, provider)
  .then((result) => {
   
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const user = result.user;
    console.log(user);
    window.location.href = "../logged.html"
  }).catch((error) => {
    
    const errorCode = error.code;
    const errorMessage = error.message;
    
    
  });
})


