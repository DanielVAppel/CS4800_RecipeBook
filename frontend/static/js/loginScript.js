const firebaseConfig = {
   apiKey: "AIzaSyCDHx8Nf9PVIsSWulOZLnLqUha9zLVExg0",
   authDomain: "recipe-cookbook-ada79.firebaseapp.com",
   projectId: "recipe-cookbook-ada79",
   storageBucket: "recipe-cookbook-ada79.appspot.com",
   messagingSenderId: "307671574733",
   appId: "1:307671574733:web:feeeb24deb74dd299be184",
   measurementId: "G-4FH210WLMQ"
 };

const firebaseApp = initializeApp(firebaseConfig);
const firebaseAuth = getAuth(firebaseApp);
firebaseAuth.languageCode = "en";
const authProvider = new GoogleAuthProvider();

document.addEventListener("DOMContentLoaded", function () {
   console.log("DOMContentLoaded");
   // or however you want to grab the button element
   const attachLoginEventListener = () => {
      console.log("eventHandlerCalled");
      const loginButton = document.getElementById("loginButton");

      // functionality for logging user in when button is clicked
      loginButton.addEventListener("click", function (event) {
         event.preventDefault();
         console.log("button clicked");
         firebaseAuth.signInWithPopup(firebaseAuth, authProvider).then((result) => {
            console.log(result);
            const { user } = result;

            const options = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                // you can pass either the user or the result
                //
                // this will be sent to the flask app which you can
                // then return a render_template (updated html page)
                // and then you can just replace the current page content
                // inside div.mainContainer with the content you just
                // got from the updated html page
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