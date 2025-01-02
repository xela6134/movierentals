from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
import mysql.connector
from dotenv import load_dotenv
import os

load_dotenv()

movies_bp = Blueprint('movies', __name__)

config = {
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'host': os.getenv('DB_HOST'),
    'port': int(os.getenv('DB_PORT')),
    'database': os.getenv('DB_NAME')
}

def get_db_connection():
    return mysql.connector.connect(**config)

@movies_bp.route('/movies', methods=['GET'])
@jwt_required()
def get_movies():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    query = "select * from movies"
    cursor.execute(query)
    movies = cursor.fetchall()

    cursor.close()
    conn.close()
    return jsonify(movies)

@movies_bp.route('/movie_posters', methods=['GET'])
@jwt_required()
def get_movie_posters():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    query = "select * from movie_posters"
    cursor.execute(query)
    movies = cursor.fetchall()
    
    for row in movies:
        print(row)

    cursor.close()
    conn.close()
    return jsonify(movies)

