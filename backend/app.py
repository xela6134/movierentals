from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
import os
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

CORS(app, origins=["http://localhost:3000"], supports_credentials=True)

def get_db_connection():
    return mysql.connector.connect(**config)

@app.route('/api/movies', methods=['GET'])
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

@app.route('/api/users', methods=['GET'])
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
