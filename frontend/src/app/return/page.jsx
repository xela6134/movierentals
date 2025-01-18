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

  const [rating, setRating] = useState(3);
  const [hoverRating, setHoverRating] = useState(0); // For hover effect
  const [review, setReview] = useState('');

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

  const handleReturn = async (e) => {
    try {
      e.preventDefault();

      if (!review.trim()) {
        setError('Please write a review before returning the movie.');
        return;
      }

      const payload = {
        movie_id: selectedMovie,
        rating: rating,
        review: review
      };

      const csrfToken = Cookies.get('csrf_access_token');
      const returnResponse = await axios.post(`/api/reservations/return`,
        payload,
        {
          headers: { 'X-CSRF-TOKEN': csrfToken },
          withCredentials: true,
        }
      );

      if (returnResponse.status === 200) {
        fetchData();
        alert('Movie returned successfully!');
        setSelectedMovie('');
        setSelectedMovieTitle('');
        setRating(3);
        setReview('');
        setHoverRating(0);
        setError('');
      }
    } catch (error) {
      console.error(error);
      setError(error.response?.data?.msg || 'An error occurred while returning the movie.');
    }
  };

  return (
    <div className="flex items-center w-full justify-start flex-col default-background text-white p-4">
      {!auth.loading && !auth.isAuthenticated && (
        <div>You have not logged in. Redirecting to home page...</div>
      )}
      {!auth.loading && auth.isAuthenticated && (
        <div className="border-2 border-gray-700 mt-12 rounded-lg w-full max-w-md">
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
                className="mb-2 text-white block"
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
                  <p className="mt-4">Leave a review before returning {selectedMovieTitle}!</p>
                  <form onSubmit={handleReturn} className="mt-4">
                    <div className="flex items-center mb-4">
                      <span className="mr-2">Rating:</span>
                      {[...Array(5)].map((star, index) => {
                        const starValue = index + 1;
                        return (
                          <svg
                            key={index}
                            className={`w-6 h-6 cursor-pointer ${
                              starValue <= (hoverRating || rating) ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                            onClick={() => setRating(starValue)}
                            onMouseEnter={() => setHoverRating(starValue)}
                            onMouseLeave={() => setHoverRating(0)}
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.377 2.455a1 1 0 00-.364 1.118l1.286 3.967c.3.921-.755 1.688-1.54 1.118l-3.377-2.455a1 1 0 00-1.176 0l-3.377 2.455c-.785.57-1.84-.197-1.54-1.118l1.286-3.967a1 1 0 00-.364-1.118L2.98 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z" />
                          </svg>
                        );
                      })}
                    </div>

                    <label htmlFor="review" className="block mb-2">
                      Review:
                    </label>
                    <textarea
                      id="review"
                      value={review}
                      onChange={(e) => setReview(e.target.value)}
                      className="w-full p-2 rounded focus:outline-none text-black resize-none h-24"
                      placeholder="Write your review here..."
                      required
                    />

                    <button 
                      type="submit"
                      className="bg-green-600 mt-4 px-4 py-2 rounded hover:bg-green-900 w-full"
                    >
                      Return
                    </button>
                  </form>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
