from dotenv import load_dotenv              # type: ignore
from flask import Flask, jsonify, request   # type: ignore
from flask_cors import CORS                 # type: ignore
import os
import mysql.connector                      # type: ignore

load_dotenv()

config = {
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'host': os.getenv('DB_HOST'),
    'port': int(os.getenv('DB_PORT')),
    'database': os.getenv('DB_NAME')
}

app = Flask(__name__)
CORS(app)

def get_db_connection():
    return mysql.connector.connect(**config)

@app.route('/api/movies', methods=['GET'])
def get_movies():
    print(f"API '/api/movies' called from {request.remote_addr}")
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    query = "select * from movies"
    cursor.execute(query)
    movies = cursor.fetchall()

    cursor.close()
    conn.close()
    print(movies)
    return jsonify(movies)

@app.route('/api/users', methods=['GET'])
def get_users():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    query = "select * from users"
    cursor.execute(query)
    users = cursor.fetchall()

    cursor.close()
    conn.close()
    return jsonify(users)

if __name__ == '__main__':
    app.run(debug=True)
