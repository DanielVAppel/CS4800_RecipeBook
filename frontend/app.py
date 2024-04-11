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
    favoriteRecipes = generate_random_recipes()

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
