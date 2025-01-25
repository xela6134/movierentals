from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
import mysql.connector
from dotenv import load_dotenv
from datetime import datetime
import os
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity

load_dotenv()

recommendations_bp = Blueprint('recommendations', __name__)

config = {
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'host': os.getenv('DB_HOST'),
    'port': int(os.getenv('DB_PORT')),
    'database': os.getenv('DB_NAME')
}

def get_db_connection():
    return mysql.connector.connect(**config)

# left join used just in case there are movies without reviews (later on)
select_query = """
select m.id as m_id, avg(r.rating) as avg, count(r.u_id) as count
from movies m
left join reviews r on m.id = r.m_id
group by m.id;
"""

# ---------------------- #
#     HELPER METHODS     #
# ---------------------- #

def fetch_reviews_and_genres():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("select m_id, u_id, rating from reviews")
    reviews_data = cursor.fetchall()
    cursor.execute("select id as m_id, genre from genres")
    genres_data = cursor.fetchall()

    reviews_df = pd.DataFrame(reviews_data)
    genres_df = pd.DataFrame(genres_data)

    cursor.close()
    conn.close()

    return reviews_df, genres_df

def fetch_aggregates():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    sql_query = """
    select m.id as m_id, avg(r.rating) as avg_rating, count(r.u_id) as rental_count
    from movies m
    join reviews r on m.id = r.m_id
    group by m.id;
    """
    
    cursor.execute(sql_query)
    data = cursor.fetchall()
    df = pd.DataFrame(data)
    
    cursor.close()
    conn.close()
    
    return df
    
def fetch_relevant_movie_data(recommended_ids):
    if not recommended_ids:
        return []

    conn = get_db_connection()
    cursor = conn.cursor()

    placeholders = ','.join(['%s'] * len(recommended_ids))
    
    sql_query = f"""
    select m.id, m.title, mp.img
    from movies m
    join movie_posters mp on m.id = mp.id
    where m.id in ({placeholders})
    """
    cursor.execute(sql_query, recommended_ids)
    movie_data = cursor.fetchall()

    cursor.close()
    conn.close()

    return movie_data

def build_user_item_matrix(reviews_df):
    """
    Build a user-movie matrix from reviews DataFrame.
    Rows: users, Columns: movies
    """
    if reviews_df.empty:
        return pd.DataFrame()

    user_item_matrix = reviews_df.pivot_table(
        index='u_id',
        columns='m_id',
        values='rating',
        aggfunc='mean'
    ).fillna(0.0)

    return user_item_matrix

# Recommend movies that similar users liked based on collaborative filtering
def user_based_cf(user_id, reviews_df, top_n=5):
    if reviews_df.empty:
        return []

    # Build matrix
    user_item_matrix = build_user_item_matrix(reviews_df)

    if user_id not in user_item_matrix.index:
        return []

    # Compute cosine similarity between users
    similarity_matrix = cosine_similarity(user_item_matrix)
    similarity_df = pd.DataFrame(
        similarity_matrix,
        index=user_item_matrix.index,
        columns=user_item_matrix.index
    )

    if user_id not in similarity_df.columns:
        return []

    # Retrieve similarity scores for the target user, excluding itself
    user_similarities = similarity_df[user_id].drop(user_id, errors='ignore')
    user_similarities = user_similarities.sort_values(ascending=False)

    # Get top k users & ratings
    k = 5
    top_k_users = user_similarities.head(k).index
    top_k_ratings = user_item_matrix.loc[top_k_users].T

    # For each movie, compute a weighted score by
    # summing the product of each similar user's rating for movie m
    # and that user's similarity to the current user.
    # Then divide by sum of similarities
    # -> Giving us a predicted rating for a movie from the current user, based on what similar users rated movie m.
    for similar_user in top_k_users:
        top_k_ratings[similar_user] *= user_similarities[similar_user]

    weighted_scores = top_k_ratings.sum(axis=1)
    similarity_sum = user_similarities.head(k).sum()

    if similarity_sum == 0.0:
        return []

    final_scores = weighted_scores / similarity_sum
    user_rated_movies = reviews_df[reviews_df['u_id'] == user_id]['m_id'].unique()
    final_scores = final_scores.drop(labels=user_rated_movies, errors='ignore')
    final_scores = final_scores.sort_values(ascending=False).head(top_n)

    recommended_movie_ids = final_scores.index.tolist()
    return recommended_movie_ids

# Recommend movies similar to those the user rated highly, based on collaborative filtering
def item_based_cf(user_id, reviews_df, top_n=5):
    if reviews_df.empty:
        return []

    user_item_matrix = build_user_item_matrix(reviews_df)

    if user_id not in user_item_matrix.index:
        return []
    
    # We need transposed matrix for similarity computation
    item_user_matrix = user_item_matrix.T

    # Compute cosine similarity between movies
    similarity_matrix = cosine_similarity(item_user_matrix)
    similarity_df = pd.DataFrame(
        similarity_matrix,
        index=item_user_matrix.index,
        columns=item_user_matrix.index
    )

    # Select movies rated highly by the user
    user_ratings = user_item_matrix.loc[user_id]
    high_rated_movies = user_ratings[user_ratings >= 4].index.tolist()
    if not high_rated_movies:
        return []

    # Calculate average similarity scores across all high-rated movies
    similarity_scores = similarity_df[high_rated_movies].mean(axis=1)
    similarity_scores = similarity_scores.drop(labels=high_rated_movies, errors='ignore')

    user_rated_movies = reviews_df[reviews_df['u_id'] == user_id]['m_id'].unique()
    similarity_scores = similarity_scores.drop(labels=user_rated_movies, errors='ignore')

    final_scores = similarity_scores.sort_values(ascending=False).head(top_n)

    recommended_movie_ids = final_scores.index.tolist()
    return recommended_movie_ids

# Recommends movies with the highest genre affinity scores that the user hasn't rated
def genre_similarity(user_id, reviews_df: pd.DataFrame, genres_df: pd.DataFrame, top_n=5):
    """
    Genre Similarity:
    1. Identify user's preferred genres (based on highly rated movies)
    2. Recommend other movies matching those genres
    """
    if reviews_df.empty or genres_df.empty:
        return []

    user_item_matrix = build_user_item_matrix(reviews_df)
    if user_id not in user_item_matrix.index:
        return []

    # Get movies user rated highly
    user_ratings = user_item_matrix.loc[user_id]
    highly_rated_movies = user_ratings[user_ratings >= 4].index.tolist()
    if not highly_rated_movies:
        return []

    # Get genres of highly-rated movies
    user_genres = genres_df[genres_df['m_id'].isin(highly_rated_movies)]
    if user_genres.empty:
        return []

    genre_counts = user_genres['genre'].value_counts()
    genre_weights = genre_counts / genre_counts.sum()

    # Create a binary matrix of movies and their genres
    all_genres = genres_df['genre'].unique()
    movie_genre_matrix = genres_df.assign(value=1).pivot_table(
        index='m_id', columns='genre', values='value', fill_value=0
    )

    movie_genre_matrix = movie_genre_matrix.reindex(columns=all_genres, fill_value=0)

    # Weight genres by user's preferences
    for g in genre_weights.index:
        movie_genre_matrix[g] = movie_genre_matrix[g] * genre_weights[g]

    # Calculate genre affinity score for each movie
    movie_genre_matrix['genre_score'] = movie_genre_matrix.sum(axis=1)

    user_rated_movies = reviews_df[reviews_df['u_id'] == user_id]['m_id'].unique()
    to_recommend = movie_genre_matrix[~movie_genre_matrix.index.isin(user_rated_movies)]
    to_recommend = to_recommend.sort_values('genre_score', ascending=False).head(top_n)

    recommended_movie_ids = to_recommend.index.tolist()
    return recommended_movie_ids

# Composite Score = 0.5 * (Normalised Rating) + 0.5 * (Normalised Rental Count)
def composite_ratings(df: pd.DataFrame, top_n=5):
    # Null handling from left join
    df['avg_rating'] = df['avg_rating'].fillna(0)
    df['rental_count'] = df['rental_count'].fillna(0)
    
    df['avg_rating'] = df['avg_rating'].astype(float)
    df['rental_count'] = df['rental_count'].astype(float)

    # Normalisation Process
    if df['avg_rating'].max() != df['avg_rating'].min():
        df['rating_score'] = (df['avg_rating'] - df['avg_rating'].min()) / (df['avg_rating'].max() - df['avg_rating'].min())
    else:
        df['rating_score'] = 0.0
    
    if df['rental_count'].max() != df['rental_count'].min():
        df['rental_score'] = (df['rental_count'] - df['rental_count'].min()) / (df['rental_count'].max() - df['rental_count'].min())
    else:
        df['rental_score'] = 0.0
    
    df['composite_score'] = 0.5 * df['rating_score'] + 0.5 * df['rental_score']
    
    recommendations = df.sort_values(by='composite_score', ascending=False).head(top_n)
    recommended_movie_ids = recommendations['m_id'].tolist()

    return recommended_movie_ids

############
## Routes ##
############

# Recommends movies based on similar user's preferences
@recommendations_bp.route('/recommendations/user-cf', methods=['GET'])
@jwt_required()
def get_user_based_cf():
    try:
        user_id = get_jwt_identity()
        reviews_df, _ = fetch_reviews_and_genres()

        recommended_ids = user_based_cf(user_id, reviews_df, top_n=7)    
        recommended_movies = fetch_relevant_movie_data(recommended_ids)

        return jsonify({
            "user_id": user_id,
            "recommendations": recommended_movies
        }), 200
    except Exception as e:
        print(f"Exception caught: {e}")
        return jsonify({"msg": "Internal Server Error"}), 500

# Recommends movies based on user's current preference (rating >= 4)
@recommendations_bp.route('/recommendations/movie-cf', methods=['GET'])
@jwt_required()
def get_item_based_cf():
    try:
        user_id = get_jwt_identity()
        reviews_df, _ = fetch_reviews_and_genres()

        recommended_ids = item_based_cf(user_id, reviews_df, top_n=7)
        recommended_movies = fetch_relevant_movie_data(recommended_ids)

        return jsonify({
            "user_id": user_id,
            "recommendations": recommended_movies
        }), 200
    except Exception as e:
        print(f"Exception caught: {e}")
        return jsonify({"msg": "Internal server error"}), 500

# Recommends movies based on user's genre preferences
@recommendations_bp.route('/recommendations/genre', methods=['GET'])
@jwt_required()
def get_genre_recommendations():
    try:
        user_id = get_jwt_identity()
        reviews_df, genres_df = fetch_reviews_and_genres()

        recommended_ids = genre_similarity(user_id, reviews_df, genres_df, top_n=7)
        recommended_movies = fetch_relevant_movie_data(recommended_ids)
        
        return jsonify({
            "user_id": user_id,
            "recommendations": recommended_movies
        }), 200
    except Exception as e:
        print(f"Exception caught: {e}")
        return jsonify({"msg": "Internal server error"}), 500

# Combines average rating & rental count to rank movies
@recommendations_bp.route('/recommendations/composite', methods=['GET'])
@jwt_required()
def get_composite_recommendations():
    try:
        user_id = get_jwt_identity()
        df = fetch_aggregates()

        recommended_ids = composite_ratings(df, top_n=7)
        recommended_movies = fetch_relevant_movie_data(recommended_ids)
        
        return jsonify({
            "user_id": user_id,
            "recommendations": recommended_movies
        }), 200
    except Exception as e:
        print(f"Exception caught: {e}")
        return jsonify({"msg": f"Internal server error. {e}"}), 500
