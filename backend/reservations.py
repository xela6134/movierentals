from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
import mysql.connector
from dotenv import load_dotenv
from datetime import datetime
import os

load_dotenv()

reservations_bp = Blueprint('reservations', __name__)

config = {
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'host': os.getenv('DB_HOST'),
    'port': int(os.getenv('DB_PORT')),
    'database': os.getenv('DB_NAME')
}

add_reservations_query = """
insert into reservations
(m_id, u_id, reservation_date)
values (%s, %s, %s)
"""

add_reviews_query = """
insert into reviews
(m_id, u_id, rating, review)
values (%s, %s, %s, %s)
"""

def get_db_connection():
    return mysql.connector.connect(**config)

@reservations_bp.route('/reservations', methods=['GET'])
@jwt_required()
def get_reservations():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        query = "select * from reservations"
        cursor.execute(query)
        reservations = cursor.fetchall()

        return jsonify(reservations), 200
    except Exception as e:
        print(f"Exception caught: {e}")
        return jsonify({"msg": "Internal server error"}), 500
    finally:
        cursor.close()
        conn.close()

@reservations_bp.route('/reservations/curruser', methods=['GET'])
@jwt_required()
def get_current_reservations():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        current_user_id = get_jwt_identity()

        query = "select r.m_id, r.u_id, m.title from reservations r join movies m on r.m_id = m.id where r.u_id = %s"

        cursor.execute(query, (current_user_id,))
        reservations = cursor.fetchall()

        return jsonify(reservations), 200
    except Exception as e:
        print(f"Exception caught: {e}")
        return jsonify({"msg": "Internal server error"}), 500
    finally:
        cursor.close()
        conn.close()

@reservations_bp.route('/reservations/movie/<int:id>', methods=['GET'])
@jwt_required()
def get_reservations_by_movie(id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        query = "select * from reservations where m_id = %s"
        cursor.execute(query, (id,))
        reservations = cursor.fetchall()

        return jsonify(reservations), 200
    except Exception as e:
        print(f"Exception caught: {e}")
        return jsonify({"msg": "Internal server error"}), 500
    finally:
        cursor.close()
        conn.close()

@reservations_bp.route('/reservations/user/<int:id>', methods=['GET'])
@jwt_required()
def get_reservations_by_user(id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        query = "select * from reservations where u_id = %s"
        cursor.execute(query, (id,))
        reservations = cursor.fetchall()

        return jsonify(reservations), 200
    except Exception as e:
        print(f"Exception caught: {e}")
        return jsonify({"msg": "Internal server error"}), 500
    finally:
        cursor.close()
        conn.close()

@reservations_bp.route('/reservations/validity', methods=['GET'])
@jwt_required()
def check_valid_reservation():
    try:
        movie_id = request.args.get('movie_id', type=int)
        current_user_id = get_jwt_identity()
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        query = "select * from reservations where m_id = %s and u_id = %s"
        cursor.execute(query, (movie_id, current_user_id))
        reservations = cursor.fetchall()
        
        return jsonify(reservations), 200
    except Exception as e:
        print(f"Exception: {e}")
        return jsonify({"msg": "Internal server error."}), 500

@reservations_bp.route('/reservations/borrow', methods=['POST'])
@jwt_required()
def borrow():
    try:
        data = request.get_json()
        movie_id = data.get('movie_id')
        current_user_id = get_jwt_identity()
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Some error handling
        try:
            movie_id = int(data.get('movie_id'))
        except ValueError:
            return jsonify({"msg": "Movie ID must be a valid number."}), 400
        
        cursor.execute("select * from movies where id = %s", (movie_id,))
        movie = cursor.fetchone()
        if not movie:
            return jsonify({"msg": "Movie not found."}), 404
        
        copies = movie[4]
        if copies == 0:
            return jsonify({"msg": "No DVDs left."}), 400

        cursor.execute("select * from users where id = %s", (current_user_id,))
        user = cursor.fetchone()        
        if not user:
            return jsonify({"msg": "User not found"}), 404
        
        cursor.execute("select * from reservations where m_id = %s and u_id = %s", (movie_id, current_user_id))
        curr = cursor.fetchone()
        if curr:
            return jsonify({"msg": "You are already borrowing this movie"}), 400

        # 1. Add value into reservations table
        current_date = datetime.utcnow()
        formatted_date = current_date.strftime('%Y-%m-%d')
        cursor.execute(add_reservations_query, (movie_id, current_user_id, formatted_date))

        # 2. Update movies
        cursor.execute("update movies set copies = %s where id = %s", (copies - 1, movie_id))
        
        conn.commit()
        return jsonify({"msg": "Profile updated successfully."}), 200
    except Exception as e:
        print(f"Exception: {e}")
        return jsonify({"msg": "Internal server error."}), 500
    finally:
        cursor.close()
        conn.close()

@reservations_bp.route('/reservations/return', methods=['POST'])
@jwt_required()
def return_dvd():
    try:
        data = request.get_json()
        movie_id = data.get('movie_id')
        rating = data.get('rating')
        review = data.get('review')
        current_user_id = get_jwt_identity()
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Some error handling
        try:
            movie_id = int(movie_id)
            rating = int(rating)
        except ValueError:
            return jsonify({"msg": "Movie ID must be a valid number."}), 400

        if rating < 1 or rating > 5:
            return jsonify({"msg": "Rating must be a number between 1 and 5."}), 400
        
        if len(review.strip()) == 0:
            return jsonify({"msg": "Enter a valid string"}), 400

        cursor.execute("select * from movies where id = %s", (movie_id,))
        movie = cursor.fetchone()
        if not movie:
            return jsonify({"msg": "Movie not found."}), 404
        
        copies = movie[4]
        if copies == 0:
            return jsonify({"msg": "No DVDs left."}), 400

        cursor.execute("select * from users where id = %s", (current_user_id,))
        user = cursor.fetchone()
        if not user:
            return jsonify({"msg": "User not found"}), 404
        
        cursor.execute("select * from reservations where m_id = %s and u_id = %s", (movie_id, current_user_id))
        curr = cursor.fetchone()
        if not curr:
            return jsonify({"msg": "You are not borrowing this movie"}), 400

        # 1. Delete value from reservations table
        cursor.execute("delete from reservations where m_id = %s and u_id = %s", (movie_id, current_user_id))

        # 2. Update movies
        cursor.execute("update movies set copies = %s where id = %s", (copies + 1, movie_id))

        # 3. Add reviews
        cursor.execute(add_reviews_query, (movie_id, current_user_id, rating, review))

        print(f"{rating}: {review}")
        conn.commit()
        return jsonify({"msg": "Profile updated successfully."}), 200
    except Exception as e:
        print(f"Exception: {e}")
        conn.rollback()
        return jsonify({"msg": "Internal server error."}), 500
    finally:
        cursor.close()
        conn.close()
