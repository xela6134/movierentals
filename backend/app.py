from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity, unset_jwt_cookies, unset_access_cookies
from auth import auth_bp
from movies import movies_bp
from users import users_bp
from reviews import reviews_bp
import os

load_dotenv()

app = Flask(__name__)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = int(os.getenv('JWT_ACCESS_TOKEN_EXPIRES'))
app.config['JWT_TOKEN_LOCATION'] = ['cookies']
app.config['JWT_ACCESS_COOKIE_NAME'] = 'access_token_cookie'
app.config['JWT_COOKIE_SECURE'] = False         # TODO: For localhost dev only, change in production
app.config['JWT_COOKIE_SAMESITE'] = 'None'
app.config['JWT_ACCESS_COOKIE_PATH'] = '/'
app.config['JWT_COOKIE_CSRF_PROTECT'] = True

# Change the origin on deploy
CORS(app, origins=["http://localhost:3000"], supports_credentials=True)

app.register_blueprint(auth_bp)
app.register_blueprint(movies_bp)
app.register_blueprint(users_bp)
app.register_blueprint(reviews_bp)

if __name__ == '__main__':
    app.run(debug=True)
