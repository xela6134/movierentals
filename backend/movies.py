from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
import mysql.connector
from dotenv import load_dotenv
import os, requests

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
        print(f"Exception caught: {e}")
        return jsonify({"msg": "Internal server error"}), 500
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

        return jsonify(movies), 200
    except Exception as e:
        print(f"Exception caught: {e}")
        return jsonify({"msg": "Internal server error"}), 500
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
        print(f"Exception caught: {e}")
        return jsonify({"msg": "Internal server error"}), 500
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
        print(f"Exception caught: {e}")
        return jsonify({"msg": "Internal server error"}), 500
    finally:
        cursor.close()
        conn.close()

@movies_bp.route('/movies/detail', methods=['GET'])
@jwt_required()
def get_movie_details():
    try:
        title = request.args.get('title', type=str)
        year = request.args.get('year', type=int)
        
        params = {
            't': title,
            'y': year,
            'apikey': os.getenv('OMDBAPI_KEY')
        }
        
        link = "https://www.omdbapi.com"
        response = requests.get(link, params=params)
        data = response.json()
        
        if data['Response'] == "True":
            return data, 200
        else:
            return jsonify({"msg": f"Movie details with title {title} and year {year} not found"})
    except Exception as e:
        print(f"Exception caught: {e}")
        return jsonify({"msg": "Internal server error"}), 500
