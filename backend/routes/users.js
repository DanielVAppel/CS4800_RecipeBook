//This router file will be for anything that prefixes with /user. For example the first GET request
//will retrieve all users with http://localhost:3000/users/

const express = require('express')
const firebase_admin = require('firebase-admin') 
const router = express.Router()
const multer = require('multer')

const serviceAccount = require("../key.json")
const admin = firebase_admin.initializeApp({
    credential: firebase_admin.credential.cert(serviceAccount),
    storageBucket: 'recipe-cookbook-ada79.appspot.com'
})

const firestore = admin.firestore();
const bucket = admin.storage().bucket();

const upload = multer({
    storage: multer.memoryStorage(), // Store file in memory
    limits: {
        fileSize: 5 * 1024 * 1024, // Limit file size to 5MB
    },
});

//Get all user documents, EXAMPLE URL: http://localhost:3000/users/
router.get('/', async (req,res) => {
    const users = [];

    const querySnapshot = await firestore.collection('users').get();
    querySnapshot.forEach((doc) => {
        console.log(doc.id)
        //Return userID(same as doc name), dislayName, photoURL, and created recipes,
        users.push({userID: doc.get("userUID"), 
        displayName:doc.get("displayName"), 
        photoURL: doc.get("photo"),
        }) 
    })

    res.status(200).send(users);
})


//Get a single user document, EXAMPLE URL: http://localhost:3000/users/KbKURAhryoOJOYfrMx4jlVYg96j2
router.get('/:id', async (req,res) => {
    const id = req.params.id;
    
    const docRef = firestore.collection("users").doc(id);
    const doc = await docRef.get();

    if(!doc.exists){
        res.status(404).send('Not Found')
    } else {
        const customRecipesRef = docRef.collection('customRecipes')
        const customRecipesSnapshot = await customRecipesRef.get();

        const customRecipesData = customRecipesSnapshot.docs.map(doc => ({
            id: doc.id
            //etc
        }))

        //Return userID(same as doc name), displayName, photoURL, and created recipes,
        res.status(200).send({
            userID: doc.get("userUID"), 
            displayName:doc.get("displayName"), 
            photoURL: doc.get("photo"), 
            customRecipes: customRecipesData
        }) 
    }
})

//Create a new document in users collection, fields required should be "displayName", "photo", "userUID".
//userUID should be the same as the docRef ID
//EXAMPLE URL: http://localhost:3000/users/KbKURAhryoOJOYfrMx4jlVYg96j2
router.post('/:id', async (req,res) => {
    const id = req.params.id;
    const data = req.body;

    const docRef = firestore.collection('users').doc(id);
    
    try {
        await docRef.set(data);
        res.status(200).send("Successfully added: " + docRef.id);
    } catch (error) {
        res.status(500).send("Error occurred while trying to create a new document");
    }
})


//Update a document in users collection, EXAMPLE URL: http://localhost:3000/users/KbKURAhryoOJOYfrMx4jlVYg96j2
router.put('/:id', async (req,res) => {
    const id = req.params.id;
    const data = req.body
    
    const docRef = firestore.collection('users').doc(id);
    
    try {
        await docRef.update(data);
        res.status(200).send("Successfully updated:" + docRef.id);
    } catch (error) {
        res.status(500).send("Error occurred while trying to update the document");
    }
})

//Delete a document in users collection, EXAMPLE URL: http://localhost:3000/users/KbKURAhryoOJOYfrMx4jlVYg96j2
router.delete('/:id', async (req,res) => {
    const id = req.params.id;
    const docRef = firestore.collection('users').doc(id);
    try {
        await docRef.delete();
        res.status(200).send("Successfully deleted" + docRef.id);
    } catch (error) {
        res.status(500).send("Error occurred while trying to delete the document");
    }
})

//Create a custom recipe, will add a subcollection to docRef titled "customRecipes"
//EXAMPLE URL: http://localhost:3000/users/KbKURAhryoOJOYfrMx4jlVYg96j2/customRecipe
router.post('/:id/customRecipe', upload.single('file'),async (req,res) => {
    const id = req.params.id;
    const colRef = firestore.collection('users').doc(id).collection('customRecipes');
    const data = req.body;
    const file = req.file;

    try {
        // Check if file exists in the request
        if (!file) {
            return res.status(400).send('No file uploaded.');
        }

        // Upload the file to Firebase Storage
        const blob = bucket.file(file.originalname);
        const blobStream = blob.createWriteStream({
            metadata: {
                contentType: file.mimetype,
            },
        });

        blobStream.on('error', (err) => {
            console.log(err)
            res.status(500).send('Error uploading file to Firebase Storage.');
        });

        blobStream.on('finish', async () => {
            // Once the file is uploaded, add fileURL to data and store in Firestore
            data.fileURL = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;

            try {
                await colRef.add(data);
                res.status(200).send("Successfully created recipe.");
            } catch (error) {
                res.status(500).send("Error occurred while trying to create recipe in Firestore.");
            }
        });

        blobStream.end(file.buffer); // Write file buffer to storage
    } catch (error) {
        res.status(500).send("Error occurred while processing file upload.");
    }
})

//Get all custom recipes of user
//EXAMPLE URL: http://localhost:3000/users/KbKURAhryoOJOYfrMx4jlVYg96j2/customRecipe/
router.get('/:id/customRecipe/', async (req,res) => {
    const id = req.params.id;
    const recipes = [];

    const querySnapshot = await firestore.collection('users').doc(id).collection('customRecipes').get();
    querySnapshot.forEach((doc) => {
        console.log(doc.id)
        recipes.push({
            fileURL: doc.get("fileURL"),
            name: doc.get("name"),
            servings: doc.get("servings"),
            cookTime: doc.get("cookTime"),
            ingredients: doc.get("ingredients"),
            equipment: doc.get("equipment"),
            instructions: doc.get("instructions")
        })
    })
    res.status(200).send(recipes);
    
})
//Get custom recipe
//EXAMPLE URL: http://localhost:3000/users/KbKURAhryoOJOYfrMx4jlVYg96j2/customRecipe/bruh
router.get('/:id/customRecipe/:recipeID', async (req,res) => {
    const id = req.params.id;
    const recipeID = req.params.recipeID;
    const recipeRef = firestore.collection('users').doc(id).collection('customRecipes').doc(recipeID);

    try{
        const doc = await recipeRef.get();
        if(!doc.exists){
            res.status(404).send('Recipe not found')
        } else {
            const recipeData = doc.data();
            res.status(200).send(recipeData)
        }
    } catch(error){
        res.status(500).send("Error occurred while trying to retrieve recipe")
    }
})

//Update a custom recipe 
//EXAMPLE URL: http://localhost:3000/users/KbKURAhryoOJOYfrMx4jlVYg96j2/customRecipe/
router.put('/:id/customRecipe/:recipeID', async (req,res) => {
    const id = req.params.id;
    const recipeID = req.params.recipeID;
    const recipeRef = firestore.collection('users').doc(id).collection('customRecipes').doc(recipeID);
    const data = req.body

    try {
        await recipeRef.update(data);
        res.status(200).send("Successfully updated:" + recipeID);
    } catch (error) {
        res.status(500).send("Error occurred while trying to update the document");
    }
})

module.exports = router