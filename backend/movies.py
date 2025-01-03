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
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        query = "select * from movies"
        cursor.execute(query)
        movies = cursor.fetchall()

        return jsonify(movies), 200
    except Exception as e:
        return jsonify({"msg": f"Internal server error: {e}"}), 500
    finally:
        cursor.close()
        conn.close()

@movies_bp.route('/movie_posters', methods=['GET'])
@jwt_required()
def get_movie_posters():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        query = "select * from movie_posters"
        cursor.execute(query)
        movies = cursor.fetchall()
        
        for row in movies:
            print(row)

        return jsonify(movies), 200
    except Exception as e:
        return jsonify({"msg": f"Internal server error: {e}"}), 500
    finally:
        cursor.close()
        conn.close()

@movies_bp.route('/movies/<int:id>', methods=['GET'])
@jwt_required()
def get_movie_by_id(id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("select * from movies where id = %s", (id,))
        movie = cursor.fetchone()
        
        if movie:
            return jsonify(movie), 200
        else:
            return jsonify({"msg": f"Movie with id {id} not found."}), 404
    except Exception as e:
        return jsonify({"msg": f"Internal server error: {e}"}), 500
    finally:
        cursor.close()
        conn.close()

@movies_bp.route('/movie_posters/<int:id>', methods=['GET'])
@jwt_required()
def get_movie_poster_by_id(id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("select * from movie_posters where id = %s", (id,))
        movie = cursor.fetchone()
        
        if movie:
            return jsonify(movie), 200
        else:
            return jsonify({"msg": f"Movie poster with id {id} not found."}), 404
    except Exception as e:
        return jsonify({"msg": f"Internal server error: {e}"}), 500
    finally:
        cursor.close()
        conn.close()
