'use client';

import { AuthContext } from '@/components/AuthContext';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import React, { useContext, useEffect, useState } from 'react';

export default function Return() {
  const { auth } = useContext(AuthContext);
  const router = useRouter();

  const [error, setError] = useState('');
  const [borrowing, setBorrowing] = useState(null);
  const [selectedMovie, setSelectedMovie] = useState('');
  const [selectedMovieTitle, setSelectedMovieTitle] = useState('');

  useEffect(() => {
    if (!auth.loading) {
      if (!auth.isAuthenticated) {
        setTimeout(() => {
          router.push('/');
        }, 1500);
      } else {
        fetchData();
      }
    }
  }, [auth.loading, auth.isAuthenticated, router]);

  const fetchData = async () => {
    try {
      const borrowingResponse = await axios.get(`/api/reservations/curruser`, { 
        withCredentials: true 
      });
      setBorrowing(borrowingResponse.data);
    } catch (error) {
      console.error(error);
      setError(error.response?.data?.msg || 'An error occurred');
    }
  };

  const handleSelectChange = (e) => {
    const selectedId = e.target.value;
    setSelectedMovie(selectedId);

    const selected = borrowing.find((movie) => String(movie.m_id) === selectedId);

    if (selected) {
      setSelectedMovieTitle(selected.title);
    } else {
      setSelectedMovieTitle('');
    }
  };

  const handleReturn = async () => {
    try {
      const payload = {
        movie_id: selectedMovie
      };

      const csrfToken = Cookies.get('csrf_access_token');
      const returnResponse = await axios.post(`/api/reservations/return`,
        payload,
        {
          headers: { 'X-CSRF-TOKEN': csrfToken, },
          withCredentials: true,
        }
      );

      if (returnResponse.status === 200) {
        fetchData();
        alert('Movie returned successfully!');
      }
    } catch (error) {
      console.error(error);
      setError(error.response.data.msg);
    }
  };

  return (
    <div className="flex items-center w-full justify-start flex-col default-background text-white p-4">
      {!auth.loading && !auth.isAuthenticated && (
        <div>You have not logged in. Redirecting to home page...</div>
      )}
      {!auth.loading && auth.isAuthenticated && (
        <div className="border-2 border-gray-700 mt-12 rounded-lg">
          {borrowing === null && (
            <p className="p-6">Loading data...</p>
          )}
          {borrowing !== null && borrowing.length === 0 && (
            <p className="p-6">No movies to return!</p>
          )}
          {borrowing !== null && borrowing.length !== 0 && (
            <div className="p-6">
              {error && <div className="text-red-400 my-4">{error}</div>}
              <label 
                htmlFor="movie-select" 
                className="mb-2 text-white"
              >
                Select a movie to return:
              </label>
              <select
                id="movie-select"
                value={selectedMovie}
                onChange={handleSelectChange}
                className="block w-full mt-2 p-2 bg-gray-800 border border-gray-700 rounded"
              >
                <option value="">-- Choose a movie --</option>
                {borrowing.map((movie) => (
                  <option key={movie.m_id} value={movie.m_id}>
                    {movie.title}
                  </option>
                ))}
              </select>
              {selectedMovie && (
                <>
                  <p className="mt-4">Are you sure you want to return {selectedMovieTitle}?</p>
                  <button 
                    className="bg-green-600 mt-2 px-3 py-1 rounded hover:bg-green-900"
                    onClick={handleReturn}
                  >
                    Return
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
