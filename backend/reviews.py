from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
import mysql.connector
from dotenv import load_dotenv
import os

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
        reviews = cursor.fetchall()

        return jsonify(reviews), 200
    except Exception as e:
        print(f"Exception caught: {e}")
        conn.rollback()
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
        reviews = cursor.fetchall()

        return jsonify(reviews), 200
    except Exception as e:
        print(f"Exception caught: {e}")
        conn.rollback()
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
        reviews = cursor.fetchall()

        return jsonify(reviews), 200
    except Exception as e:
        print(f"Exception caught: {e}")
        conn.rollback()
        return jsonify({"msg": "Internal server error"}), 500
    finally:
        cursor.close()
        conn.close()

@reviews_bp.route('/reviews/specific', methods=['GET'])
@jwt_required()
def get_specific_review():
    try:
        movie_id = request.args.get('movie_id', type=int)
        current_user_id = int(get_jwt_identity())
        
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Error Handling
        try:
            movie_id = int(movie_id)
            current_user_id = int(current_user_id)
        except ValueError:
            return jsonify({"msg": "ID is not a numeric."}), 400
        
        cursor.execute("select * from movies where id = %s", (movie_id,))
        result = cursor.fetchone()
        
        if not result:
            return jsonify({"msg": "Movie not found"}), 404
        
        cursor.execute("select * from users where id = %s", (current_user_id,))
        result = cursor.fetchone()
        
        if not result:
            return jsonify({"msg": "User not found"}), 404

        query = "select * from reviews where m_id = %s and u_id = %s"
        cursor.execute(query, (movie_id, current_user_id))
        reviews = cursor.fetchall()

        return jsonify(reviews), 200
    except Exception as e:
        print(f"Exception caught: {e}")
        conn.rollback()
        return jsonify({"msg": "Internal server error"}), 500
    finally:
        cursor.close()
        conn.close()

@reviews_bp.route('/reviews/curruser', methods=['GET'])
@jwt_required()
def get_current_user_reviews():
    try:
        current_user_id = int(get_jwt_identity())
        
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        query = "select * from reviews where u_id = %s"
        cursor.execute(query, (current_user_id,))
        reviews = cursor.fetchall()

        return jsonify(reviews), 200
    except Exception as e:
        print(f"Exception caught: {e}")
        conn.rollback()
        return jsonify({"msg": "Internal server error"}), 500
    finally:
        cursor.close()
        conn.close()