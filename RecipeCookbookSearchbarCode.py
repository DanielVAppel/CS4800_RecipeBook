#This is the code for searching for recipes using the API via python flask for it.

from flask import Flask, render_template, request
import requests
from urllib.parse import unquote

app = Flask(__name__)

API_KEY = 'INSERT API KEY'

#Define route for "Home button"
@app.route("/home", methods=['GET'])
def home():
    return render_template('index.html', recipes=[], recipe_query='')

@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        query = request.form.get('recipe_query','')
        recipes = search_recipes(query)
        return render_template('index.html', recipes=recipes, recipe_query=query)
    
    recipe_query = request.args.get('recipe_query','')
    decoded_recipe_query = unquote(recipe_query)
    recipes = search_recipes(decoded_recipe_query)
    return render_template('index.html', recipes=recipes, recipe_query=decoded_recipe_query)

def search_recipes(query):
    url = f'https://api.spoonacular.com/recipes/complexSearch'
    params = {
        'apiKey': API_KEY,
        'query': query,
        'number': 10,
        'instructionsRequired':True,
        'addRecipeInformation':True,
        'fillIngredients':True,
    }

    response = requests.get(url, params=params)
    if response.status_code == 200:
        data = response.json()
        return data['results']
    return[]

#Go to a specific recipe given ID
@app.route('/recipe/<int:recipe_id>')
def view_recipe(recipe_id):
    recipe_query = request.args.get('recipe_query','')
    url=f'https://api.spoonacular.com/recipes/{recipe_id}/information'
    params = {
        'apiKey': API_KEY,
    }

    #Send a GET request to API to get recipe information
    response = requests.get(url, params=params)
    if response.status_code == 200:
        recipe = response.json()
        return render_template('view_recipe.html', recipe=recipe, recipe_query=recipe_query)
    return "Recipe not found", 404
