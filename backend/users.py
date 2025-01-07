from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import mysql.connector
from dotenv import load_dotenv
import os

load_dotenv()

users_bp = Blueprint('users', __name__)

config = {
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'host': os.getenv('DB_HOST'),
    'port': int(os.getenv('DB_PORT')),
    'database': os.getenv('DB_NAME')
}

def get_db_connection():
    return mysql.connector.connect(**config)

@users_bp.route('/users', methods=['GET'])
@jwt_required()
def get_users():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        query = "select * from users"
        cursor.execute(query)
        users = cursor.fetchall()

        return jsonify(users), 200
    except Exception as e:
        print(f"Exception caught: {e}")
        return jsonify({"msg": "Internal server error."}), 500
    finally:
        cursor.close()
        conn.close()

@users_bp.route('/users/<int:id>', methods=['GET'])
@jwt_required()
def get_user_by_id(id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        query = "select * from users where id = %s"
        cursor.execute(query, (id,))
        user = cursor.fetchone()
        
        if user:
            return jsonify(user), 200
        else:
            return jsonify({"msg": f"User with id {id} not found."}), 404
    except Exception as e:
        print(f"Exception caught: {e}")
        return jsonify({"msg": "Internal server error."}), 500
    finally:
        cursor.close()
        conn.close()

@users_bp.route('/users/curruser', methods=['GET'])
@jwt_required()
def get_username():
    current_user_id = get_jwt_identity()
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("select name from users where id = %s", (current_user_id,))
        user = cursor.fetchone()
        if not user:
            return jsonify({"msg": "User not found."}), 404
        return jsonify({"username": user['name']}), 200
    except Exception as e:
        print(f"Exception caught: {e}")
        return jsonify({"msg": "Internal server error."}), 500
    finally:
        cursor.close()
        conn.close()

@users_bp.route('/users/currid', methods=['GET'])
@jwt_required()
def get_userid():
    try:
        current_user_id = get_jwt_identity()
        
        if not current_user_id:
            return jsonify({"msg": "User not found."}), 404
        return jsonify({"id": current_user_id}), 200
    except Exception as e:
        print(f"Exception caught: {e}")
        return jsonify({"msg": "Internal server error."}), 500
