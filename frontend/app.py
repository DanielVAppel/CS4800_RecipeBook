import re
import os
import requests
from dotenv import load_dotenv
from flask import Flask, render_template

# load env vars
load_dotenv()

app = Flask(__name__)

@app.route("/")
def home_page():
    # navigation tab
    navItems = ["search", "home", "create", "user"]

    # recommended dishes/recipes
    recommendedRecipes = generate_random_recipes()

    return render_template("index.html", navItems=navItems, recommendedRecipes=recommendedRecipes)

@app.route("/favorites")
def favorites_page():
    # navigation tab
    navItems = ["search", "home", "create", "user"]

    # recommended dishes/recipes
<<<<<<< Updated upstream
    favoriteRecipes = generate_random_recipes()
=======
    global recommendedRecipes
    favoriteRecipes = recommendedRecipes if len(recommendedRecipes) > 0 else generate_random_recipes()
    
    return render_template("favorites.html", navItems=navItems, favoriteRecipes=favoriteRecipes, uid=uid)


@app.route("/signUserIn", methods=["POST"])
def userLoggedIn():
  # you could add smth that will get the query for which html page to render
  userInfo = request.json
  if userInfo != None:
    print(userInfo)
    
    global uid
    uid = userInfo['uid']
    photoURL = userInfo['photoURL']
    displayName = userInfo['displayName']
    
    response = requests.get(f'http://localhost:3000/users/{uid}')
    
    if response.status_code == 404:
        body = {
            'displayName': displayName,
            'photo': photoURL,
            'userUID': uid,
            # other data
        }
        response = requests.post(f'http://localhost:3000/users/{uid}', json=body)
    else:
        # userID, displayName, etc
        response = response.json()
    
    return render_template("favorites.html", navItems=navItems, favoriteRecipes=[], uid=uid)


@app.route("/createRecipe", methods=["POST"])
def createRecipePost():
  # you could add smth that will get the query for which html page to render
  recipeInfo = request.json
  if uid != None:
    print('no login')
    
    file = recipeInfo['file']
    name = recipeInfo['name']
    servings = recipeInfo['servings']
    time = recipeInfo['time']
    ingredients = recipeInfo['ingredients']
    equipment = recipeInfo['equipment']
    instructions = recipeInfo['instructions']
    
    body = {
        'fileInput': file,
        'recipeName': name,
        'recipeServings': servings,
        'recipeTime': time,
        'recipeIngredients': ingredients,
        'recipeEquipment': equipment,
        'recipeInstructions': instructions
        # other data
    }
    response = requests.post(f'http://localhost:3000/users/{uid}/customRecipe', json=body)
    
    return render_template("create.html", navItems=navItems, uid=uid)


# HELPER FUNCTIONS/ROUTES
# 
# RB = recipe book
# search function for when user is searching for recipes (search page)
@app.route("/search_recipe")
def RB_search_recipe():
    query = request.args.get('query')
    
    # find all recipes that fit query
    # returns { offset, results: [{ id, title, image (unusable) }] }
    # 
    # https://spoonacular.com/food-api/docs#Search-Recipes-Complex
    found_recipes = search_recipe_by_query(query=query)
    
    if len(found_recipes) == 0:
        raise ValueError("No recipes returned by Spoonacular API")
    
    # extract recipe ids for detailed search
    recipe_id_list = [recipe["id"] for recipe in found_recipes]
    
    # get recipe information for all recipes
    #
    # RIM = readyInMinutes
    # returns { title, description, image, servings, RIM, sourceUrl, etc }
    # 
    # https://spoonacular.com/food-api/docs#Get-Recipe-Information
    recipes_detailed = []
    for id in recipe_id_list:
        recipe_information = search_recipe_by_id(id)
        
        # check if recipe data is retrieved from Spoonacular API
        if recipe_information != None:
            recipes_detailed.append(recipe_information)
        
    if len(recipes_detailed) == 0:
        raise ValueError("Unable to retrieve recipes by id using Spoonacular API")
    
    # return recipes_detailed
    return render_template("search.html", navItems=navItems, resultItems=recipes_detailed)
>>>>>>> Stashed changes

    return render_template("favorites.html", navItems=navItems, favoriteRecipes=favoriteRecipes)

# generate home page "Recipe of the Day / Recommended Recipes"
def generate_random_recipes():
    url = 'https://api.spoonacular.com/recipes/random'
    params = {
        'apiKey': os.getenv("SPOONACULAR_API_KEY"),
        'number': 10,
    }

    response = requests.get(url, params=params)
    if response.status_code == 200:
        data = response.json()

        # remove html tags from summary
        clean = re.compile('<.*?>')
        
        for recipe in data['recipes']:
            recipe['summary'] = re.sub(clean, '', recipe['summary'])

        return data['recipes']
    return []


if __name__ == "__main__":
    app.run(debug=True)
