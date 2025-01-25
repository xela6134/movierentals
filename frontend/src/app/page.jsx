// app/page.jsx
'use client';

import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '@/components/AuthContext';
import axios from 'axios';

export default function Root() {
  const { auth } = useContext(AuthContext);
  const [error, setError] = useState('');
  const [compositeRecommendations, setCompositeRecommendations] = useState([]);
  const [userRecommendations, setUserRecommendations] = useState([]);
  const [movieRecommendations, setMovieRecommendations] = useState([]);
  const [genreRecommendations, setGenreRecommendations] = useState([]);

  useEffect(() => {
    if (!auth.loading && auth.isAuthenticated) {
      fetchData();
    }
  }, [auth.loading, auth.isAuthenticated]);

  const fetchData = async () => {
    try {
      const compositeResponse = await axios.get(`/api/recommendations/composite`, {
        withCredentials: true
      });
      setCompositeRecommendations(compositeResponse.data.recommendations);

      const userResponse = await axios.get(`/api/recommendations/user-cf`, {
        withCredentials: true
      });
      setUserRecommendations(userResponse.data.recommendations);

      const movieResponse = await axios.get(`/api/recommendations/movie-cf`, {
        withCredentials: true
      });
      setMovieRecommendations(movieResponse.data.recommendations);

      const genreResponse = await axios.get(`/api/recommendations/genre`, {
        withCredentials: true
      });
      setGenreRecommendations(genreResponse.data.recommendations);
    } catch (error) {
      console.error(error);
      setError(error.response.data.msg);
    }
  };

  const renderRecommendations = (recommendations, title) => (
    <div className="p-8 border-2 border-white rounded-lg">
      <p className="text-2xl mb-4">{title}:</p>
      <div className="w-full flex gap-8 overflow-auto custom-scrollbar">
        {recommendations.map((movie) => {
          const movieTitle = movie[1];
          const movieUrl = movie[2];

          return (
            <div key={movie[0]} className="flex-shrink-0 w-80">
              {movieUrl ? (
                <img
                  src={movieUrl}
                  alt={`${movieTitle} Poster`}
                  className="w-full object-cover rounded"
                />
              ) : (
                <img
                  src="/images/default_movie.jpg"
                  alt="No Image Available"
                  className="w-full object-cover rounded opacity-50"
                />
              )}
              <div className="flex w-full justify-center items-center text-xl font-kanit p-2">
                {movieTitle.length > 30 ? movieTitle.substring(0, 27) + "..." : movieTitle}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="flex items-center w-full justify-start flex-col default-background text-white p-4">
      <div className="text-3xl">
        Welcome to <span className="text-4xl font-bold text-red-600 font-bebas">CineVault</span> -
      </div>
      <div className="text-center text-lg my-4">
        <p>Your friendly local DVD Rental Shop at the verge of extinction because of the Netflix era.</p>
        <p>
          Fund us on Patreon&nbsp;
          <a
            href="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
            className="text-red-600 hover:text-red-900"
            target="_blank"
            rel="noopener noreferrer"
          >
            here
          </a>
          &nbsp;!
        </p>
      </div>
      {!auth.isAuthenticated ? (
        <div className="my-4 text-2xl font-kanit">
          <p>Login or register to view or rent our movies!</p>
        </div>
      ) : (
        <div className="w-full flex flex-col p-8 gap-8">
          <h1 className="text-3xl font-kanit">Recommended movies for you -</h1>
          {error && <p className="mb-4 text-red-600">{error}</p>}
          {renderRecommendations(compositeRecommendations, "All Time Favourites")}
          {renderRecommendations(userRecommendations, "Similar users have borrowed")}
          {renderRecommendations(movieRecommendations, "Related to your taste")}
          {renderRecommendations(genreRecommendations, "Based on your favourite genres")}
        </div>
      )}
    </div>
  );
}
