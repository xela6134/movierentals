// src/app/movies/[id]/page.jsx
'use client';

import React, { useEffect, useState, useContext } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import { AuthContext } from '@/components/AuthContext';

export default function MovieDetail() {
  const { auth, setAuth } = useContext(AuthContext);
  const router = useRouter();
  const params = useParams();

  const [movie, setMovie] = useState({});
  const [poster, setPoster] = useState();
  const [reviews, setReviews] = useState([]);
  const [users, setUsers] = useState([]);
  const [moreData, setMoreData] = useState();
  const [error, setError] = useState();

  const movieId = params.id;

  useEffect(() => {
    if (!auth.loading) {
      if (!auth.isAuthenticated) {
        setTimeout(() => {
          router.push('/');
        }, 1500);
      } else {
        fetchMovie();
        fetchPoster();
        fetchReviews();
        fetchUsers();
      }
    }
  }, [auth.loading, auth.isAuthenticated, router]);

  // Fetches info about current movie
  const fetchMovie = () => {
    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/movies/${movieId}`, { withCredentials: true })
      .then((response) => {
        const data = response.data;
        setMovie(data);
      })
      .catch((error) => {
        console.error(error);
        setError("Error fetching movie information.");
      })
  };

  // Fetches poster about current movie
  const fetchPoster = () => {
    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/movie_posters/${movieId}`, { withCredentials: true })
      .then((response) => {
        const data = response.data;
        setPoster(data.img);
      })
      .catch((error) => {
        console.error(error);
        setError("Error fetching movie poster.");
      })
  };

  // Fetches reviews about current movie
  const fetchReviews = () => {
    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/reviews/movie/${movieId}`, { withCredentials: true })
      .then((response) => {
        const data = response.data;
        setReviews(data);
      })
      .catch((error) => {
        console.error(error);
        setError("Error fetching reviews.");
      })
  };

  // Fetches all users
  const fetchUsers = () => {
    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/users`, { withCredentials: true })
      .then((response) => {
        const data = response.data;
        setUsers(data);
      })
      .catch((error) => {
        console.error(error);
        setError("Error fetching users.");
      })
  }

  const fetchDetails = () => {
    if (!movie.title || !movie.released) {
      console.error("Movie title or release date is missing.");
      return;
    }

    const title = movie.title;
    const year = movie.released;

    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/movies/detail`, {
      params: { title, year },
      withCredentials: true
    })
      .then((response) => {
        const data = response.data;
        if (data["Response"] == "True") {
          setMoreData(data);
        } else {
          setError("Cannot fetch details about this movie.");
        }
      })
      .catch((error) => {
        console.error("Error fetching movie details:", error);
        setError("Error fetching movie details.");
      });
  };

  return (
    <div className="flex items-center w-full justify-start flex-col default-background text-white">
      {!auth.loading && !auth.isAuthenticated && (
        <div>Not allowed to view movie. Redirecting to home page...</div>
      )}
      {!auth.loading && auth.isAuthenticated && (
        <div className="w-full h-screen flex">
          <div className="w-1/2 h-full flex flex-col items-center">
            <div className="text-4xl text-center">
              {movie ? (
                <p className="font-bold">{movie.title}</p>
              ) : (
                <p className="text-white">Loading title...</p>
              )}
            </div>
            {poster ? (
              <img
                src={poster}
                alt={`${movie.title} Poster`}
                className="w-2/5 h-auto object-cover m-4 rounded"
              />
            ) : (
              <img
                src="/images/default.jpg"
                alt="No Image Available"
                className="w-2/5 h-auto object-cover m-4 rounded opacity-50"
              />
            )}
            {error && <div className="text-red-400 text-xl mt-2">{error}</div>}
            {movie ? (
              <div className="w-4/5 p-4 mt-8 primary-background border-gray-700 border-2 rounded shadow-md">
                <p>
                  <strong>Director:</strong> {movie.director}
                </p>
                <p>
                  <strong>Released:</strong> {movie.released}
                </p>
                <p>
                  <strong>Copies:</strong> {movie.copies}
                </p>
                {moreData ? (
                  <>
                    <p>
                      <strong>Actors:</strong> {moreData.Actors}
                    </p>
                    <p>
                      <strong>Awards:</strong> {moreData.Awards}
                    </p>
                    <p>
                      <strong>Box Office:</strong> {moreData.BoxOffice}
                    </p>
                    <p>
                      <strong>Metascore:</strong> {moreData.Metascore}
                    </p>
                    <p>
                      <strong>Plot:</strong> {moreData.Plot}
                    </p>
                    <p>
                      <strong>Rated:</strong> {moreData.Rated}
                    </p>
                    <p>
                      <strong>IMDB Rating:</strong> {moreData.imdbRating}
                    </p>
                  </>
                ) : (
                  <button 
                    className="my-4 border-2 border-white px-2 py-1 rounded"
                    onClick={fetchDetails}
                  >
                    More information
                  </button>
                )}
              </div>
            ) : (
              <p>Loading information...</p>
            )}
          </div>
          <div className="w-1/2 h-full flex flex-col items-center p-4">
            <h2 className="text-2xl text-center font-bold mb-4">Reviews</h2>
            <div className="p-4 w-full flex flex-col items-center">
              {reviews.length > 0 ? (
                reviews.map((review, index) => {
                  const user = users.find(u => u.id === review.u_id);
                  return (
                    <div
                      key={`${review.u_id}-${index}`}
                      className="w-11/12 bg-gray-800 p-4 rounded shadow-md mb-4"
                    >
                      <p className="text-lg font-semibold mb-2">
                        {user ? user.name : 'Unknown User'}
                      </p>
                      
                      <div className="flex items-center mb-2">
                        <span className="font-semibold mr-2">Rating:</span>
                        {Array.from({ length: 5 }, (_, i) => (
                          <svg
                            key={i}
                            className={`w-5 h-5 ${
                              i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.377 2.455a1 1 0 00-.364 1.118l1.286 3.967c.3.921-.755 1.688-1.54 1.118l-3.377-2.455a1 1 0 00-1.176 0l-3.377 2.455c-.785.57-1.84-.197-1.54-1.118l1.286-3.967a1 1 0 00-.364-1.118L2.98 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z" />
                          </svg>
                        ))}
                      </div>
                      <p className="text-gray-300">{review.review}</p>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-400">No reviews available for this movie.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}