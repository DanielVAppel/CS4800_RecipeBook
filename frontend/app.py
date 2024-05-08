import re
import os
import requests
from dotenv import load_dotenv
from flask import Flask, request, render_template

# load env vars
load_dotenv()

app = Flask(__name__)

# navigation tab
navItems = ["search", "home", "create", "user"]

recipe_cache = {}
recent_recipes = []
uid = None

@app.route("/")   
@app.route("/home")
def home_page():
    # recommended dishes/recipes
    recommendedRecipes = generate_random_recipes()
    
    if len(recommendedRecipes) == 0:
        raise ValueError("No recipes returned by Spoonacular API")

    return render_template("home.html", navItems=navItems, recommendedRecipes=recommendedRecipes)


@app.route("/search")
def search_page():
    filterItems = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Appetizer', 'Main Course', 'Dessert']
    
    return render_template("search.html", navItems=navItems, searchFilters=filterItems, resultItems=[])


@app.route("/create")
def create_page():
    return render_template("create.html", navItems=navItems, uid=uid)

@app.route("/user")
def user_page():
    # gets all of user's created recipes
    createdRecipes = []
    global uid
    createdRecipes = requests.get(f'http://localhost:3000/users/{uid}/customRecipes')
    createdRecipes = createdRecipes.json()

    # recommended dishes/recipes
    recipeIdList = requests.get(f'http://localhost:3000/users/{uid}/favoriteRecipeList')
    recipeIdList = recipeIdList.json()
    
    favoriteRecipes = []
    if len(recipeIdList) != 0:
        for id in recipeIdList['recipeIdList']:
            favoriteRecipes.append(search_recipe_by_id(id))

    return render_template("user.html", navItems=navItems, favoriteRecipes=favoriteRecipes, createdRecipes=createdRecipes, uid=uid)


@app.route("/signUserIn", methods=["POST"])
def userLoggedIn():
    query = request.args.get('fileName')
  # you could add smth that will get the query for which html page to render
    userInfo = request.json
    if userInfo != None:
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
                'savedRecipes': []
                # other data
            }
            response = requests.post(f'http://localhost:3000/users/{uid}', json=body)
        else:
            # userID, displayName, etc
            response = response.json()

        # gets all of user's created recipes
        createdRecipes = []
        createdRecipes = requests.get(f'http://localhost:3000/users/{uid}/customRecipes')
        createdRecipes = createdRecipes.json()
        
        recipeIdList = requests.get(f'http://localhost:3000/users/{uid}/favoriteRecipeList')
        recipeIdList = recipeIdList.json()
    
        favoriteRecipes = []
        if len(recipeIdList) != 0:
            for id in recipeIdList['recipeIdList']:
                favoriteRecipes.append(search_recipe_by_id(id))
                
        return render_template(f"{query}.html", navItems=navItems, favoriteRecipes=favoriteRecipes, createdRecipes=createdRecipes, uid=uid)

@app.route("/createRecipe", methods=["POST"])
def createRecipePost():
  # you could add smth that will get the query for which html page to render
  recipeInfo = request.json
  global uid
  if uid != None:
    name = recipeInfo['name']
    servings = recipeInfo['servings']
    time = recipeInfo['time']
    ingredients = recipeInfo['ingredients']
    equipment = recipeInfo['equipment']
    instructions = recipeInfo['instructions']
    
    body = {
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


@app.route("/favoriteRecipe", methods=["POST"])
def favoriteRecipe():
    recipeInfo = request.json
    
    if uid != None:
        body = {
            'recipeId': recipeInfo['id']
        }
        
        response = requests.post(f'http://localhost:3000/users/{uid}/favoriteRecipe', json=body)


# HELPER FUNCTIONS/ROUTES
# 
# RB = recipe book
@app.route("/show_recipe")
def RB_show_recipe():
    recipe_id = request.args.get('id')
    
    recipeItem = search_recipe_by_id(recipe_id)
    
    return render_template("recipe.html", recipeItem=recipeItem)

# search function for when user is searching for recipes (search page)
@app.route("/search_recipe")
def RB_search_recipe():
    query = request.args.get('query')
    filter = request.args.get('filter')
    
    # find all recipes that fit query
    # returns { offset, results: [{ id, title, image (unusable) }] }
    # 
    # https://spoonacular.com/food-api/docs#Search-Recipes-Complex
    found_recipes = search_recipe_by_query(query=query, filter=filter)
    
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
            
            global recipe_cache
            recipe_cache[id] = recipe_information

    if len(recipes_detailed) == 0:
        raise ValueError("Unable to retrieve recipes by id using Spoonacular API")
    
    # return recipes_detailed
    return render_template("search.html", navItems=navItems, resultItems=recipes_detailed)


# generate home page "Recipe of the Day / Recommended Recipes"
def generate_random_recipes():
    global recent_recipes
    if len(recent_recipes) > 0:
        return recent_recipes
    
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
            
            global recipe_cache
            recipe_cache[recipe['id']] = recipe
            
        recent_recipes = data['recipes']
        return data['recipes']
    else:
        raise RuntimeError(response.content)
    

def search_recipe_by_query(query, filter, limit=5):
    # /search returns { id, title, image (unusable), servings, RIM, sourceUrl }
    # /complexSearch returns { id, title, image }
    
    url = 'https://api.spoonacular.com/recipes/complexSearch'
    params = {
        'apiKey': os.getenv("SPOONACULAR_API_KEY"),
        'query': query,
        'number': limit
    }
    
    if filter is not None:
        params['filter'] = filter
    
    response = requests.get(url, params=params)
    if response.status_code == 200:
        data = response.json()

        return data['results']
    elif response.status_code == 402:
        print("API LIMIT REACHED")
    
    return []


def search_recipe_by_id(id):
    id = int(id)
    
    global recipe_cache
    if id in recipe_cache:
        return recipe_cache[id]
    
    url = f'https://api.spoonacular.com/recipes/{id}/information'
    params = {
        'apiKey': os.getenv("SPOONACULAR_API_KEY")
    }
    
    response = requests.get(url, params=params)
    if response.status_code == 200:
        data = response.json()
        
        clean = re.compile('<.*?>')
        
        data['summary'] = re.sub(clean, '', data['summary'])
        
        recipe_cache[data['id']] = data

        return data
    return None


if __name__ == "__main__":
    app.run(debug=True)
