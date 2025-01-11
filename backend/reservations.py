from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
import mysql.connector
from dotenv import load_dotenv
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
