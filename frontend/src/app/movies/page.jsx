// app/movies/page.jsx
'use client';

import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '@/components/AuthContext';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function Movies() {
  const { auth, setAuth } = useContext(AuthContext);
  const router = useRouter();
  const [movies, setMovies] = useState([]);
  const [error, setError] = useState([]);

  useEffect(() => {
    if (!auth.loading) {
      if (!auth.isAuthenticated) {
        setTimeout(() => {
          router.push('/');
        }, 1500);
      } else {
        fetchMovies();
      }
    }
  }, [auth.loading, auth.isAuthenticated, router]);

  const fetchMovies = () => {
    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/movies`, { withCredentials: true })
      .then((response) => {
        console.log(response.data);
        setMovies(response.data);
      })
      .catch((error) => {
        console.error(error);
        setError("Failed to load movies. Try again later")
      })
  };

  return (
    <div className="min-h-screen flex items-center justify-start flex-col default-background text-white">
      <h1 className="text-center text-3xl my-8">Movies</h1>
      {!auth.loading && auth.isAuthenticated && (
        <>
          {error && <div className="mb-4 max-w-[208px] text-red-400">{error}</div>}
          <div className="flex flex-wrap justify-center m-8 gap-4">
            {movies.map(movie => (
              <div key={movie.id} className="bg-gray-800 p-4 rounded shadow-md w-80 h-48">
                <h2 className="text-xl font-bold mb-4 text-center">{movie.title}</h2>
                <p><strong>Director:</strong> {movie.director}</p>
                <p><strong>Released:</strong> {movie.released}</p>
                <p><strong>Copies:</strong> {movie.copies}</p>
              </div>
            ))}
          </div>
        </>
      )}
      {!auth.loading && !auth.isAuthenticated && (
        <div>
          Not allowed to view movies. Redirecting to home page...
        </div>
      )}
    </div>
  )
}
