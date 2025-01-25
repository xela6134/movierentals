// app/page.jsx
'use client';

import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '@/components/AuthContext';
import axios from 'axios';

export default function Root() {
  const { auth } = useContext(AuthContext);
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
    const compositeResponse = await axios.get(`/api/recommendations/composite`, {
      withCredentials: true
    })
    console.log(compositeResponse.data.recommendations);

    const userResponse = await axios.get(`/api/recommendations/user-cf`, {
      withCredentials: true
    });
    console.log(userResponse.data.recommendations);

    const movieResponse = await axios.get(`/api/recommendations/movie-cf`, {
      withCredentials: true
    });
    console.log(movieResponse.data.recommendations);

    const genreResponse = await axios.get(`/api/recommendations/genre`, {
      withCredentials: true
    });
    console.log(genreResponse.data.recommendations);
  };

  return (
    <div className="flex items-center w-full justify-start flex-col default-background text-white p-4">
      <div className="text-3xl">Welcome to <span className="text-4xl font-bold text-red-600 font-bebas">CineVault</span> -</div>
      <div className="text-center text-lg my-4">
        <p>Your friendly local DVD Rental Shop at the verge of extinction because of the Netflix era.</p>
        <p>Fund us on Patreon&nbsp;
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
      <div className="w-full flex flex-col p-8 gap-8">
        <h1 className="text-3xl font-kanit">Recommended movies for you -</h1>
        <div className="p-4 border-2 border-white rounded-lg">
          <p className="text-2xl">Based on popularity:</p>
        </div>
        <div className="p-4 border-2 border-white rounded-lg">
          <p className="text-2xl">Based on users with similar taste:</p>
        </div>
        <div className="p-4 border-2 border-white rounded-lg">
          <p className="text-2xl">Based on movies you've liked before:</p>
        </div>
        <div className="p-4 border-2 border-white rounded-lg">
          <p className="text-2xl">Based on genres you've watched:</p>
        </div>
      </div>
    </div>
  );
}
