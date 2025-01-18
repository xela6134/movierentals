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
        movie_id = int(data.get('movie_id'))
        current_user_id = get_jwt_identity()
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Some error handling
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
