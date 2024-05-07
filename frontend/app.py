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
def favorites_page():
    # recommended dishes/recipes
    favoriteRecipes = generate_random_recipes()

    return render_template("favorites.html", navItems=navItems, favoriteRecipes=favoriteRecipes)

# HELPER FUNCTIONS/ROUTES
# 
# RB = recipe book
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

    if len(recipes_detailed) == 0:
        raise ValueError("Unable to retrieve recipes by id using Spoonacular API")
    
    # return recipes_detailed
    return render_template("search.html", navItems=navItems, resultItems=recipes_detailed)


# generate home page "Recipe of the Day / Recommended Recipes"
def generate_random_recipes():
    if len(recent_recipes) > 0:
        return recent_recipes
    
    url = 'https://api.spoonacular.com/recipes/random'
    params = {
        'apiKey': os.getenv("SPOONACULAR_API_KEY"),
        'number': 1
    }

    response = requests.get(url, params=params)
    if response.status_code == 200:
        data = response.json()

        # remove html tags from summary
        clean = re.compile('<.*?>')

        for recipe in data['recipes']:
            recipe['summary'] = re.sub(clean, '', recipe['summary'])
            
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
    url = f'https://api.spoonacular.com/recipes/{id}/information'
    params = {
        'apiKey': os.getenv("SPOONACULAR_API_KEY")
    }
    
    response = requests.get(url, params=params)
    if response.status_code == 200:
        data = response.json()

        return data
    return None
        
    
if __name__ == "__main__":
    app.run(debug=True)