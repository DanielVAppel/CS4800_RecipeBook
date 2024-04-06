
//File to use firebase and get google login, 

import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js';
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js';
import { getFirestore, doc, setDoc, collection, addDoc } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js';

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

//Google login button, after loggin in, stores user data into firebase
const googleLogin = document.getElementById("google-login-btn");
googleLogin.addEventListener("click",function(){
  
  signInWithPopup(auth, provider)
  .then((result) => {
   
    /*
      Add functionality that after logging in, changes homepage and updates to reflect logged in info
    */
    
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const db = getFirestore();

    
    const user = result.user; //Get user data into user variable
    console.log(user);  //Print user data to console

    const userData = {
      displayName: user.displayName,
      photo: user.photoURL,

      followers: [],
      following: [],
      savedRecipes: [],
      createdRecipes: [],

    };

    //window.location.href = "../logged.html"     Make so after loggin in, send back to home, but with more functionalities (later)
    const colRef = collection(db, 'users');
    addDoc(colRef, userData)
      .then((docRef) => {
        console.log('Document written with ID: ', docRef.id);
    })
  .catch((error) => {
    console.error('Error adding document: ', error);
  });

    
  }).catch((error) => {
    
    const errorCode = error.code;
    const errorMessage = error.message;
    console.log('Error Code: ' + errorCode);
    console.log('Error Message: ' + errorMessage)
    console.error('Google Login Error');
    
    
  });
})




