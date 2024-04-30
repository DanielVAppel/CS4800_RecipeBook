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


// Initialize Firebase and get document reference
const app = initializeApp(firebaseConfig);
const docRefId = localStorage.getItem('docRef')

//Initialize fields
const initializeTextFields = (docRef) => {
  console.log(docRef)
  const db = getFirestore();
  getDoc(doc(db,"users", docRefId))
  .then((docSnapshot) => {
    if(docSnapshot.exists()){
      const userData = docSnapshot.data();

      const nameInput = document.getElementById("nameInput")
      nameInput.value = userData.displayName;

      const buttonImage = document.getElementById("buttonImage")
      console.log('Setting button image')
      buttonImage.src = userData.photo;
    }
  })
}
initializeTextFields(docRefId)

const goBackBtn = document.getElementById("goBackBtn");
goBackBtn.addEventListener("click", ()=> {
    window.location.href = "login.html"
})



const enterDataBtn = document.getElementById("enterDataBtn")
enterDataBtn.addEventListener("click", () => {
  const docRefId = localStorage.getItem('docRef')
  const db = getFirestore();
  const nameInput = document.getElementById('nameInput').value;
  var fileElem = document.getElementById('myFile')
  var fileInput = fileElem.files[0];
  
  console.log(docRefId)

  
  setDoc(doc(db, 'users', docRefId), {displayName: nameInput,}, {merge: true})
  .then(() => {
    console.log("Doc updated!")
  })
  .catch((error) => {
    console.error('Error updating doc:' + error)
  })


})

