from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity, unset_jwt_cookies
import os, time
import mysql.connector

load_dotenv()

config = {
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'host': os.getenv('DB_HOST'),
    'port': int(os.getenv('DB_PORT')),
    'database': os.getenv('DB_NAME')
}

app = Flask(__name__)

bcrypt = Bcrypt(app)
jwt = JWTManager(app)

app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = int(os.getenv('JWT_ACCESS_TOKEN_EXPIRES'))
app.config['JWT_TOKEN_LOCATION'] = ['cookies']
app.config['JWT_ACCESS_COOKIE_NAME'] = 'access_token_cookie'
app.config['JWT_COOKIE_SECURE'] = False    # For localhost dev only, change in production
app.config['JWT_COOKIE_SAMESITE'] = 'None'
app.config['JWT_ACCESS_COOKIE_PATH'] = '/'

# Change the origin on deploy
CORS(app, origins=["http://localhost:3000"], supports_credentials=True)

def get_db_connection():
    return mysql.connector.connect(**config)

@app.route('/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    user_id = data.get('user_id')
    password = data.get('password')
    name = data.get('name')
    age = data.get('age')

    # Validation
    if not user_id or not password or not name or not age:
        return jsonify({"msg": "All fields are required."}), 400

    try:
        age = int(age)
        if age <= 0 or age > 120:
            return jsonify({"msg": "Age must be between 1 and 120."}), 400
    except ValueError:
        return jsonify({"msg": "Age must be a valid number."}), 400

    # Hash password
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Check if user_id already exists
        cursor.execute("select id from users where user_id = %s", (user_id,))
        existing_user = cursor.fetchone()
        if existing_user:
            return jsonify({"msg": "User ID already exists."}), 409

        # Insert the new user
        cursor.execute(
            "insert into users (user_id, password, name, age) values (%s, %s, %s, %s)",
            (user_id, hashed_password, name, age)
        )
        conn.commit()

        return jsonify({"msg": "Registration successful."}), 201
    except mysql.connector.Error as err:
        print(f"Database error: {err}")
        return jsonify({"msg": "Internal server error."}), 500

    finally:
        cursor.close()
        conn.close()

@app.route('/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    user_id = data.get('user_id')
    password = data.get('password')

    # Basic validation
    if not user_id or not password:
        return jsonify({"msg": "User ID and password are required."}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Retrieve user by user_id
        cursor.execute("SELECT * FROM users WHERE user_id = %s", (user_id,))
        user = cursor.fetchone()

        if not user:
            return jsonify({"msg": "Invalid user ID or password."}), 401

        if not bcrypt.check_password_hash(user['password'], password):
            return jsonify({"msg": "Invalid user ID or password."}), 401

        # Create JWT
        access_token = create_access_token(identity=user['id'])

        response = jsonify({"msg": "Login successful."})
        response.set_cookie(
            'access_token_cookie',
            access_token,
            httponly=True,
            secure=True,
            samesite='None',     # samesite='None' and secure=True must be used together.
            max_age=3600
        )

        return response, 200

    except mysql.connector.Error as err:
        print(f"Database error: {err}")
        return jsonify({"msg": "Internal server error."}), 500

    finally:
        cursor.close()
        conn.close()

@app.route('/auth/status', methods=['GET'])
@jwt_required()
def auth_status():
    current_user_id = get_jwt_identity()
    print(current_user_id)
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("select user_id, name, age from users where id = %s", (current_user_id,))
        user = cursor.fetchone()
        if not user:
            return jsonify({"authenticated": False, "msg": "User not found."}), 404
        return jsonify({"authenticated": True, "user": user}), 200
    except mysql.connector.Error as err:
        print(f"Database error: {err}")
        return jsonify({"authenticated": False, "msg": "Internal server error."}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/auth/logout', methods=['POST'])
def logout():
    response = jsonify({"msg": "Logout successful."})
    unset_jwt_cookies(response)
    return response, 200

@app.route('/movies', methods=['GET'])
@jwt_required()
def get_movies():
    print(f"API '/api/movies' called from {request.remote_addr}")
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    query = "select * from movies"
    cursor.execute(query)
    movies = cursor.fetchall()

    cursor.close()
    conn.close()
    print(movies)
    return jsonify(movies)

@app.route('/users', methods=['GET'])
@jwt_required()
def get_users():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    query = "select * from users"
    cursor.execute(query)
    users = cursor.fetchall()

    cursor.close()
    conn.close()
    return jsonify(users)

if __name__ == '__main__':
    app.run(debug=True)
