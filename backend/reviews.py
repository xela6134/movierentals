from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
import mysql.connector
from dotenv import load_dotenv
import os, requests

load_dotenv()

reviews_bp = Blueprint('reviews', __name__)

config = {
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'host': os.getenv('DB_HOST'),
    'port': int(os.getenv('DB_PORT')),
    'database': os.getenv('DB_NAME')
}

def get_db_connection():
    return mysql.connector.connect(**config)

@reviews_bp.route('/reviews', methods=['GET'])
@jwt_required()
def get_reviews():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        query = "select * from reviews"
        cursor.execute(query)
        movies = cursor.fetchall()

        return jsonify(movies), 200
    except Exception as e:
        print(f"Exception caught: {e}")
        return jsonify({"msg": "Internal server error"}), 500
    finally:
        cursor.close()
        conn.close()

@reviews_bp.route('/reviews/movie/<int:id>', methods=['GET'])
@jwt_required()
def get_reviews_by_movie(id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        query = "select * from reviews where m_id = %s"
        cursor.execute(query, (id,))
        movies = cursor.fetchall()

        return jsonify(movies), 200
    except Exception as e:
        print(f"Exception caught: {e}")
        return jsonify({"msg": "Internal server error"}), 500
    finally:
        cursor.close()
        conn.close()

@reviews_bp.route('/reviews/user/<int:id>', methods=['GET'])
@jwt_required()
def get_reviews_by_user(id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        query = "select * from reviews where u_id = %s"
        cursor.execute(query, (id,))
        movies = cursor.fetchall()

        return jsonify(movies), 200
    except Exception as e:
        print(f"Exception caught: {e}")
        return jsonify({"msg": "Internal server error"}), 500
    finally:
        cursor.close()
        conn.close()
