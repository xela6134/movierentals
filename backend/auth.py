from flask import Blueprint, jsonify, request
from flask_bcrypt import Bcrypt
from flask_jwt_extended import (
    create_access_token, 
    jwt_required, 
    get_jwt_identity, 
    set_access_cookies,
    unset_jwt_cookies, 
    unset_access_cookies
)
import mysql.connector
import uuid
from dotenv import load_dotenv
import os

load_dotenv()

config = {
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'host': os.getenv('DB_HOST'),
    'port': int(os.getenv('DB_PORT')),
    'database': os.getenv('DB_NAME')
}

auth_bp = Blueprint('auth', __name__)
bcrypt = Bcrypt()

def get_db_connection():
    return mysql.connector.connect(**config)

@auth_bp.route('/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    user_id = data.get('user_id')
    password = data.get('password')
    name = data.get('name')
    age = data.get('age')

    # Validation
    if not user_id or not password or not name or not age:
        return jsonify({"msg": "All fields are required."}), 400

    try:
        age = int(age)
        if age <= 0 or age > 120:
            return jsonify({"msg": "Age must be between 1 and 120."}), 400
    except ValueError:
        return jsonify({"msg": "Age must be a valid number."}), 400

    # Hash password
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Check if user_id already exists
        cursor.execute("select id from users where user_id = %s", (user_id,))
        existing_user = cursor.fetchone()
        if existing_user:
            return jsonify({"msg": "User ID already exists."}), 409

        # Insert the new user
        cursor.execute(
            "insert into users (user_id, password, name, age) values (%s, %s, %s, %s)",
            (user_id, hashed_password, name, age)
        )
        conn.commit()

        return jsonify({"msg": "Registration successful."}), 201
    except Exception as e:
        print(f"Exception caught: {e}")
        return jsonify({"msg": "Internal server error."}), 500

    finally:
        cursor.close()
        conn.close()

@auth_bp.route('/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    user_id = data.get('user_id')
    password = data.get('password')

    if not user_id or not password:
        return jsonify({"msg": "User ID and password are required."}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Retrieve user by user_id
        cursor.execute("select * from users where user_id = %s", (user_id,))
        user = cursor.fetchone()

        if not user:
            return jsonify({"msg": "Invalid user ID or password."}), 401

        if not bcrypt.check_password_hash(user['password'], password):
            return jsonify({"msg": "Invalid user ID or password."}), 401

        # Create JWT
        access_token = create_access_token(identity=user['id'])

        response = jsonify({"msg": "Login successful."})
        set_access_cookies(response, access_token)

        return response, 200

    except Exception as e:
        print(f"Exception: {e}")
        return jsonify({"msg": "Internal server error."}), 500

    finally:
        cursor.close()
        conn.close()

@auth_bp.route('/auth/status', methods=['GET'])
@jwt_required()
def auth_status():
    current_user_id = get_jwt_identity()
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("select user_id, name, age from users where id = %s", (current_user_id,))
        user = cursor.fetchone()
        
        if not user:
            return jsonify({"authenticated": False, "msg": "User not found."}), 404
        return jsonify({"authenticated": True, "user": user}), 200
    except Exception as e:
        print(f"Exception caught: {e}")
        return jsonify({"authenticated": False, "msg": "Internal server error."}), 500
    finally:
        cursor.close()
        conn.close()

# Checks if password is valid for current user
@auth_bp.route('/auth/validate', methods=['GET'])
@jwt_required()
def validate():
    try:
        password = request.args.get('password', type=str)
        current_user_id = get_jwt_identity()

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("select * from users where id = %s", (current_user_id,))
        user = cursor.fetchone()

        if not user:
            return jsonify({"msg": "User not found."}), 404

        if bcrypt.check_password_hash(user['password'], password):
            return jsonify({"msg": "Password correct."}), 200
        else:
            return jsonify({"msg": "Invalid password."}), 401
    except Exception as e:
        print(f"Exception: {e}")
        return jsonify({"msg": "Internal server error."}), 500
    finally:
        cursor.close()
        conn.close()

@auth_bp.route('/auth/update', methods=['POST'])
@jwt_required()
def update():
    try:
        data = request.get_json()
        name = data.get('name')
        age = data.get('age')
        password = data.get('password')

        print(f"name: {name}, age: {age}, password: {password}")

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        if not any([name, age, password]):
            return jsonify({"msg": "At least one field (name, age, password) must be provided."}), 400

        current_user_id = get_jwt_identity()

        cursor.execute("select * from users where id = %s", (current_user_id,))
        user = cursor.fetchone()

        if not user:
            return jsonify({"msg": "User not found."}), 404

        if age and age != '':
            try:
                age = int(age)
                if age <= 0 or age > 120:
                    return jsonify({"msg": "Age must be between 1 and 120."}), 400
            except ValueError:
                return jsonify({"msg": "Age must be a valid number."}), 400

        # Update queries
        if name != None and name != '':
            update_query = "update users set name = %s where id = %s"
            cursor.execute(update_query, (name, current_user_id))
        if age != None and age != '':
            update_query = "update users set age = %s where id = %s"
            age = int(age)
            cursor.execute(update_query, (age, current_user_id))
        if password != None and password != '':
            update_query = "update users set password = %s where id = %s"
            hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
            cursor.execute(update_query, (hashed_password, current_user_id))
        
        conn.commit()

        return jsonify({"msg": "Profile updated successfully."}), 200
    except Exception as e:
        print(f"Exception caught: {e}")
        return jsonify({"msg": "Internal server error."}), 500
    finally:
        cursor.close()
        conn.close()

@auth_bp.route('/auth/logout', methods=['POST'])
def logout():
    try:
        response = jsonify({"msg": "Logout successful."})
        unset_jwt_cookies(response)
        unset_access_cookies(response)
        return response, 200
    except Exception as e:
        print(f"Exception caught: {e}")
        return jsonify({"msg": "Internal server error."}), 500
