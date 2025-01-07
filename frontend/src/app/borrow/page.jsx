// src/app/borrow/page.jsx
'use client';

import { AuthContext } from '@/components/AuthContext';
import { useRouter } from 'next/navigation';
import React, { useContext, useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';

export default function Borrow() {
  const { auth, setAuth } = useContext(AuthContext);
  const router = useRouter();
  const [movies, setMovies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [error, setError] = useState('');

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
  }, [auth.loading, auth.isAuthenticated, router])

  const fetchMovies = () => {
    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/movies`, { withCredentials: true })
      .then((response) => {
        setMovies(response.data);
        setFilteredMovies(response.data);
      })
      .catch((error) => {
        console.error(error);
        setError("Failed to load movies. Try again later");
      })
  };

  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);
    const filtered = movies.filter((movie) =>
      movie.title.toLowerCase().includes(value)
    );
    setFilteredMovies(filtered);
  };

  return (
    <>
      {!auth.loading && auth.isAuthenticated && (
        <div className="flex flex-col items-center justify-center default-background text-white w-full mt-16 p-4 gap-4">
          <div className="default-background w-3/4 text-xl rounded-lg h-16 border-2 border-gray-700 flex items-center px-4 py-2">
            <div className="w-1/4">Search for a movie:</div>
            <input
              type="text"
              placeholder="Search for a movie..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-3/4 px-2 py-1 h-10 text-black rounded-lg focus:outline-none"
            />
          </div>
          <div className="default-background w-3/4 text-xl rounded-lg h-16 border-2 border-gray-700 flex items-center px-4 py-2">
            Haven't decided yet? Click&nbsp;
            <Link 
              href={'/movies'} 
              className="text-red-600 hover:text-red-900 text-xl"
              target="_blank"
              rel="noopener noreferrer"
            >
              here
            </Link>
            &nbsp;to keep choosing your movie.
          </div>
          {error && <div className="mb-4 text-red-400">{error}</div>}
          {filteredMovies.map((movie) => {
            return (
              <div
                key={movie.id} 
                className="default-background w-3/4 text-xl border-2 border-gray-700 rounded-lg h-16 px-4 py-2 flex justify-between items-center"
              >
                <div>
                  {movie.title}
                </div>
                <div>
                  Copies left: {movie.copies}
                  <Link 
                    href={`/borrow/${movie.id}`} 
                    className="bg-red-600 text-white ml-4 px-3 py-1 rounded hover:bg-red-900"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Borrow
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
      {!auth.loading && !auth.isAuthenticated && (
        <div className="text-white text-center mt-8">Not allowed to borrow movies. Redirecting to home page...</div>
      )}
    </>
  )
}