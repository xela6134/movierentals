// app/movies/page.jsx
'use client';

import React, { useContext, useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { AuthContext } from '@/components/AuthContext';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function Movies() {
  const { auth } = useContext(AuthContext);
  const router = useRouter();
  const [movies, setMovies] = useState([]);
  const [posters, setPosters] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!auth.loading) {
      if (!auth.isAuthenticated) {
        setTimeout(() => {
          router.push('/');
        }, 1500);
      } else {
        fetchMovies();
        fetchPosters();
      }
    }
  }, [auth.loading, auth.isAuthenticated, router]);

  const fetchMovies = () => {
    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/movies`, { withCredentials: true })
      .then((response) => {
        setMovies(response.data);
      })
      .catch((error) => {
        console.error(error);
        setError("Failed to load movies. Try again later");
      })
  };

  const fetchPosters = () => {
    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/movie_posters`, { withCredentials: true })
      .then((response) => {
        setPosters(response.data);
        console.log(response.data);
      })
      .catch((error) => {
        console.error(error);
        setError("Failed to load movie posters. Try again later")
      })
  };

  const posterLookup = useMemo(() => {
    return posters.reduce((acc, poster) => {
      acc[poster.id] = poster.img;
      return acc;
    }, {});
  }, [posters]);

  return (
    <div className="min-h-screen flex items-center justify-start flex-col default-background text-white">
      <h1 className="text-center text-3xl my-8">Movies</h1>
      {!auth.loading && auth.isAuthenticated && (
        <>
          {error && <div className="mb-4 max-w-[208px] text-red-400">{error}</div>}
          <div className="flex flex-wrap justify-center m-8 gap-4">
            {movies.map((movie) => {
              const posterUrl = posterLookup[movie.id];

              return (
                <div
                  key={movie.id}
                  className="default-background border-gray-700 border-2 p-4 rounded shadow-md w-80 h-auto flex flex-col relative" // Added 'relative'
                >
                  {posterUrl ? (
                    <img
                      src={posterUrl}
                      alt={`${movie.title} Poster`}
                      className="w-full h-60 object-cover mb-4 rounded"
                    />
                  ) : (
                    <img
                      src="/images/default.jpg"
                      alt="No Image Available"
                      className="w-full h-60 object-cover mb-4 rounded opacity-50"
                    />
                  )}
                  <h2 className="text-xl font-bold mb-2 text-center">{movie.title}</h2>
                  <p>
                    <strong>Director:</strong> {movie.director}
                  </p>
                  <p>
                    <strong>Released:</strong> {movie.released}
                  </p>
                  <p>
                    <strong>Copies:</strong> {movie.copies}
                  </p>
                  <Link 
                    href={`/movies/${movie.id}`} 
                    className="absolute bottom-4 right-4 bg-red-600 text-white px-3 py-1 rounded hover:bg-red-900"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    More
                  </Link>
                </div>
              );
            })}
          </div>
        </>
      )}
      {!auth.loading && !auth.isAuthenticated && (
        <div>Not allowed to view movies. Redirecting to home page...</div>
      )}
    </div>
  );
}
