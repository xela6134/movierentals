# Fullstack Movie DVD Rental System

## Overview

This project is a fullstack movie rental system designed to allow users to sign up/log in, borrow movie DVDs, return them, write reviews, and receive movie recommendations based on their preferences and current popularity.

The application is built using:

- **Backend**: Flask (Python) with MySQL for the database
- **Frontend**: React with Tailwind CSS for styling

## Features

1. **User Authentication**
   - Sign up / Log in functionality with secure password storage.
2. **DVD Borrowing and Returning**
   - Users can browse the movie catalog, borrow movies, and return them after use.
3. **Review System**
   - Users can leave reviews and ratings for the movies they watch.
4. **Movie Recommendations**
   - Personalized movie recommendations based on user preferences and trending/popular movies.

## Installation and Setup

**WARNING**: Just a heads up this file will not run because I have intentionally left out the .env files for now

### Prerequisites

- Python (>= 3.13)
- Node.js (>= 19.0)

### Backend Setup

Navigate to the home directory of this project.

1. `cd backend`
2. `pip3 install -r requirements.txt`
3. `python3 app.py`

This will run the backend server. This must be ran before starting the frontend.

### Frontend Setup

Similarly, navigate to the home directory of this project.

1. `cd frontend`
2. `npm install`
3. `npm run dev`

## Database Structure

The database schema is structured as below - 

1. `movies`: **Database for movies**
    - `id`: Primary key
    - `title`: Title of the movie
    - `director`: Director of the movie
    - `released`: Release year of the movie
    - `copies`: Indicates how many copies of each DVD there is
2. `users`: **Database for users**
    - `id`: Primary key
    - `user_id`: ID of the user, used when logging in
    - `password`: Password of the user. Obviously hashed
    - `name`: Name of the user
    - `age`: Age of the user
    - `is_admin`: Checks if user is the admin
    - `suspended`: Indicates if user has been suspended
3. `reviews`: **Reviews for users after borrowing DVD**
    - `m_id`: ID of movie. References `movies(id)`
    - `u_id`: ID of user. References `users(id)`
    - `rating`: Rating after borrowing
    - `review`: Text of the review
4. `reservations`: **DVDs currently being borrowed**
    - `m_id`: ID of movie. References `movies(id)`
    - `u_id`: ID of user. References `users(id)`
    - `reservation_date`: Date when reservation was made
5. `genres`: **Maps genres to movies**
    - `id`: ID of movie. References `movies(id)`
    - `genre`: Genre of the movie, in text.
6. `movie_posters`: **Official Images of Movies**
    - `id`: ID of movie. References `movies(id)`
    - `img`: Link of the image
