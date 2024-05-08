
//File to use firebase and get google login

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



// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
auth.languageCode = 'en';
const provider = new GoogleAuthProvider();


//Check whether there is a user logged in or not
onAuthStateChanged(auth, (user) => {
  if(user){
    handleLoggedInState(user);
  } else {
    handleLoggedOutState();
  }
})


const handleLoggedInState = (user) => {
  const messageContainer = document.getElementById('logContainer');

  //Change page to reflect logged in state, probably need to be changed to fit with frontend code
  messageContainer.innerHTML = `
    <h1>Welcome, ${user.displayName}</h1> 
    <button id="google-logout-btn" class="google-button">Logout</button>
    <button id="change-profile-btn">Change Profile</button> 
    <button id="create-recipe-btn"> Create Recipe </button>
    `
    ;
  
    console.log("User is:" + user.displayName)
    console.log("User ID will be:" + user.uid)
    
    const createRecipeBtn = document.getElementById("create-recipe-btn");
    createRecipeBtn.addEventListener("click", () => {
      localStorage.setItem('docRef', user.uid);
      window.location.href = "createRecipe.html"
    })

    //Functionality to edit profile, probably not necessary to be here but instead move functionality to profile tab
    const changeProfileBtn = document.getElementById("change-profile-btn");
    changeProfileBtn.addEventListener("click", () => {
      console.log("PASSING TO CHANGE PROFILE:" + user.uid)
      localStorage.setItem('docRef', user.uid);
      localStorage.setItem('authState', JSON.stringify(user));
      window.location.href = "profileCreate.html" 
    })

    //Functionality to log out, maybe need to be moved to profile tab, etc.
    const googleLogoutBtn = document.getElementById("google-logout-btn");
    googleLogoutBtn.addEventListener("click", () => {
      auth.signOut()
        .then(() => {
          handleLoggedOutState(); // Update UI for logged out state
          console.log(`${user.displayName} has logged out`);
        })
        .catch((error) => {
          console.error('Logout Error:', error);
        });
    });

};

const handleLoggedOutState = () => {

  //Change page to reflect logged out state, probably need to be changed to fit with frontend code
  const messageContainer = document.getElementById('logContainer');
  messageContainer.innerHTML = `
    <h1>Welcome</h1> 
    <button id="google-login-btn" class="google-button"> <i class="fab fa-google"></i> Login with Google </button> 
    
  `
  ;

  //Functionality to login
  const googleLoginBtn = document.getElementById("google-login-btn");
  googleLoginBtn.addEventListener("click", () => {
    signInWithPopup(auth, provider)
      .then((result) => {
      
        const user = result.user;
        console.log(`${user.displayName} has logged in`);
        console.log(result)
        
        const db = getFirestore();
        console.log(user);  //Print user data to console
    
        //checkFirstLog(user.uid);
        //Dataset to be added to Firebase
        const userData = {
          userUID: user.uid,
          displayName: user.displayName,
          photo: user.photoURL,
    
          followers: [],
          following: [],
          savedRecipes: [],
          createdRecipes: [],
    
        };
    

        //Functionality of adding to Firebase
        const colRef = collection(db, 'users');
        const docRef = doc(colRef, user.uid);
        setDoc(docRef, userData, {merge: true})
          .then(() => {
            console.log('Document written with ID: ', docRef.id);
        })
      .catch((error) => {
        console.error('Error adding document: ', error);
      });
    
        
      })
      .catch((error) => {
        // Handle login error
      });
  });
};
