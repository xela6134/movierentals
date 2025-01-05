// app/movies/page.jsx
'use client';

import React, { useContext, useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { AuthContext } from '@/components/AuthContext';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function Movies() {
  const { auth, setAuth } = useContext(AuthContext);
  const router = useRouter();
  const [movies, setMovies] = useState([]);
  const [posters, setPosters] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState('');
  const [sortOption, setSortOption] = useState('id');

  useEffect(() => {
    if (!auth.loading) {
      if (!auth.isAuthenticated) {
        setTimeout(() => {
          router.push('/');
        }, 1500);
      } else {
        fetchMovies();
        fetchPosters();
        fetchReviews();
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

  const fetchReviews = () => {
    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/reviews`, { withCredentials: true })
      .then((response) => {
        setReviews(response.data);
      })
      .catch((error) => {
        console.error(error);
        setError("Failed to load reviews. Try again later");
      })
  };

  const posterLookup = useMemo(() => {
    return posters.reduce((acc, poster) => {
      acc[poster.id] = poster.img;
      return acc;
    }, {});
  }, [posters]);

  const reviewStats = useMemo(() => {
    const stats = {};

    reviews.forEach((review) => {
      const movieId = review.m_id;
      if (!stats[movieId]) {
        stats[movieId] = { count: 0, totalRating: 0 };
      }
      stats[movieId].count += 1;
      stats[movieId].totalRating += review.rating;
    });

    Object.keys(stats).forEach((id) => {
      stats[id].average = (stats[id].totalRating / stats[id].count).toFixed(2);
    });

    return stats;
  }, [reviews]);

  const sortedMovies = useMemo(() => {
    const moviesCopy = [...movies];

    switch (sortOption) {
      case 'reviews':
        moviesCopy.sort((a, b) => {
          const aReviews = reviewStats[a.id]?.count || 0;
          const bReviews = reviewStats[b.id]?.count || 0;
          return bReviews - aReviews;
        });
        break;
      case 'rating':
        moviesCopy.sort((a, b) => {
          const aRating = parseFloat(reviewStats[a.id]?.average) || 0;
          const bRating = parseFloat(reviewStats[b.id]?.average) || 0;
          return bRating - aRating;
        });
        break;
      case 'id':
        moviesCopy.sort((a, b) => a.id - b.id);
        break;
      case 'title':
        moviesCopy.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        moviesCopy.sort((a, b) => a.id - b.id);
        break;
    }

    return moviesCopy;
  }, [movies, reviewStats, sortOption]);

  return (
    <div className="min-h-screen flex items-center justify-start flex-col default-background text-white">
      {!auth.loading && auth.isAuthenticated && (
        <>
          {error && <div className="mb-4 text-red-400">{error}</div>}
          <div className="flex justify-between items-center w-full px-32 my-4">
            <div className="text-4xl">Movies</div>
            <div className="flex items-center">
              <label htmlFor="sort" className="mr-2 font-semibold">Sort By:</label>
              <select
                id="sort"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="bg-gray-700 text-white p-2 rounded"
              >
                <option value="id">ID (Default)</option>
                <option value="title">Alphabetical Order</option>
                <option value="reviews">Number of Reviews</option>
                <option value="rating">Average Rating</option>
              </select>
            </div>
          </div>
          <div className="text-xl">
            A fine list of our specially selected DVDs, only available for rent on <span className="text-2xl font-bold text-red-600 font-bebas">CineVault</span>.
          </div>
          <div className="flex flex-wrap justify-center m-8 gap-4">
            {sortedMovies.map((movie) => {
              const posterUrl = posterLookup[movie.id];
              const stats = reviewStats[movie.id];

              return (
                <div
                  key={movie.id}
                  className="default-background border-gray-700 border-2 p-4 rounded shadow-md w-80 h-auto flex flex-col relative"
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
                  <p>
                    <strong>Reviews:</strong> {stats?.count || 0}
                  </p>
                  <p>
                    <strong>Rating:</strong> {stats?.average || 'N/A'} / 5
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
          <div className="text-xl mb-8">
            Finished browsing? Click <Link href={`/borrow`} className="cursor-pointer text-red-600">here</Link> to borrow your movie.
          </div>
        </>
      )}
      {!auth.loading && !auth.isAuthenticated && (
        <div>Not allowed to view movies. Redirecting to home page...</div>
      )}
    </div>
  );
}
