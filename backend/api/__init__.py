from flask import Flask
from firebase_admin import credentials,initialize_app
import os

script_dir = os.path.dirname(os.path.abspath(__file__))
cred = credentials.Certificate(os.path.join(script_dir, "key.json"))
default_app = initialize_app(cred)

def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = '123123123zsasd'

    from .userAPI import userAPI

    app.register_blueprint(userAPI, url_prefix = '/user')

    return app