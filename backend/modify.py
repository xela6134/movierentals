# Database modification file

from dotenv import load_dotenv
import pandas
import mysql.connector
import os
from collections import Counter

load_dotenv()

config = {
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'host': os.getenv('DB_HOST'),
    'port': int(os.getenv('DB_PORT')),
    'database': os.getenv('DB_NAME')
}

add_movies_query = """
insert into movies
(id, title, director, released, copies)
values (%s, %s, %s, %s, %s)
"""

add_users_query = """
insert into users
(id, name, age, user_id, is_admin, suspended, password)
values (%s, %s, %s, %s, %s, %s, %s)
"""

add_reviews_query = """
insert into reviews
(m_id, u_id, rating, review)
values (%s, %s, %s, %s)
"""

add_genres_query = """
insert into genres
(id, genre)
values (%s, %s)
"""

add_posters_query = """
insert into movie_posters
(id, img)
values (%s, %s)
"""

def get_db_connection():
    return mysql.connector.connect(**config)

def main():
    movies_data = pandas.read_csv('admin/movies.csv')
    movies_tuples = list(movies_data.itertuples(index=False, name=None))
    
    users_data = pandas.read_csv('admin/users.csv')
    users_tuples = list(users_data.itertuples(index=False, name=None))
    
    reviews_data = pandas.read_csv('admin/reviews.csv')
    reviews_tuples = list(reviews_data.itertuples(index=False, name=None))

    genres_data = pandas.read_csv('admin/genres.csv')
    genres_tuples = list(genres_data.itertuples(index=False, name=None))
    
    posters_data = pandas.read_csv('admin/posters.csv')
    posters_data = posters_data.where(pandas.notnull(posters_data), None)
    posters_tuples = list(posters_data.itertuples(index=False, name=None))

    movie_count = Counter()
    genre_count = Counter()

    for data in genres_tuples:
        movie_count[data[0]] += 1
        genre_count[data[1]] += 1

    print("Number of genres per movie:")
    for movie_id, count in movie_count.items():
        print(f"Movie ID {movie_id}: {count} genres")

    genre_sorted = genre_count.most_common()
    print("\nNumber of movies per genre:")
    for genre, count in genre_sorted:
        print(f"Genre '{genre}': {count} movies")


    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("select * from genres")
        result = cursor.fetchall()
        for row in result:
            print(row)
    except mysql.connector.Error as err:
        print(f"add posters error: {err}")
        conn.rollback()
    finally:
        cursor.close()
        conn.close()

    # try:
    #     conn = get_db_connection()
    #     cursor = conn.cursor()

    #     cursor.execute("delete from genres")
    #     cursor.executemany(add_genres_query, genres_tuples)
    #     conn.commit()
    # except mysql.connector.Error as err:
    #     print(f"add posters error: {err}")
    #     conn.rollback()
    # finally:
    #     cursor.close()
    #     conn.close()
    
    # try:
    #     conn = get_db_connection()
    #     cursor = conn.cursor()
        
    #     cursor.executemany(add_movies_query, movies_tuples)
    #     conn.commit()
    # except mysql.connector.Error as err:
    #     print(f"add movies error: {err}")
    #     conn.rollback()
    # finally:
    #     cursor.close()
    #     conn.close()
    
    # try:
    #     conn = get_db_connection()
    #     cursor = conn.cursor()
        
    #     cursor.executemany(add_users_query, users_tuples)
    #     conn.commit()
    # except mysql.connector.Error as err:
    #     print(f"add users error: {err}")
    #     conn.rollback()
    # finally:
    #     cursor.close()
    #     conn.close()

    # try:
    #     conn = get_db_connection()
    #     cursor = conn.cursor()

    #     cursor.executemany(add_reviews_query, reviews_tuples)
    #     conn.commit()
    # except mysql.connector.Error as err:
    #     print(f"add reviews error: {err}")
    #     conn.rollback()
    # finally:
    #     cursor.close()
    #     conn.close()
    
    # try:
    #     conn = get_db_connection()
    #     cursor = conn.cursor()

    #     cursor.executemany(add_genres_query, genres_tuples)
    #     conn.commit()
    # except mysql.connector.Error as err:
    #     print(f"add genres error: {err}")
    #     conn.rollback()
    # finally:
    #     cursor.close()
    #     conn.close()

if __name__ == '__main__':
    main()
