# Fullstack Movie Rental System

## Overview

This project is a fullstack movie rental system designed to allow users to sign up/log in, borrow movies, return them, write reviews, and receive movie recommendations based on their preferences and current popularity.

The application is built using:

- **Backend**: Flask (Python) with MySQL for the database
- **Frontend**: React with Tailwind CSS for styling

## Features

1. **User Authentication**
   - Sign up / Log in functionality with secure password storage.
2. **Movie Borrowing and Returning**
   - Users can browse the movie catalog, borrow movies, and return them after use.
3. **Review System**
   - Users can leave reviews and ratings for the movies they watch.
4. **Movie Recommendations**
   - Personalized movie recommendations based on user preferences and trending/popular movies.

## Installation and Setup

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
2. `users`: **Database for users**
    - `id`: Primary key
    - `name`: Name of the user
    - `age`: Age of the user
3. `borrowed`: **Movies that have been already borrowed**
    - `m_id`: ID of movie. References `movies(id)`
    - `u_id`: ID of user. References `users(id)`
    - `rating`: Rating after borrowing
4. `borrowing`: **Movies currently being borrowed**
    - `m_id`: ID of movie. References `movies(id)`
    - `u_id`: ID of user. References `users(id)`
5. `genres`: **Maps genres to movies**
    - `id`: ID of movie. References `movies(id)`
    - `genre`: Genre of the movie, in text.
