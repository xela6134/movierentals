// src/app/borrow/[id]/page.jsx
'use client';

import { AuthContext } from '@/components/AuthContext';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useParams, useRouter } from 'next/navigation';
import React, { useContext, useEffect, useState } from 'react';

export default function BorrowSpecific() {
  const { auth, setAuth } = useContext(AuthContext);
  const router = useRouter();
  const params = useParams();
  const movieId = params.id;
  const [error, setError] = useState('');

  const [movieInfo, setMovieInfo] = useState(null);
  const [reservationInfo, setReservationInfo] = useState(null);
  const [reservationLoaded, setReservationLoaded] = useState(false);

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
      const movieResponse = await axios.get(`/api/movies/${movieId}`, {
        withCredentials: true
      });
      setMovieInfo(movieResponse.data);

      const reservationResponse = await axios.get(`/api/reservations/validity`, {
        withCredentials: true,
        params: { movie_id: movieId },
      });
      setReservationInfo(reservationResponse.data);
      setReservationLoaded(true);
    } catch (error) {
      console.error(error);
      setError(error.response.data.msg);
    }
  };

  const handleBorrow = async () => {
    try {
      const payload = {
        movie_id: movieId
      };

      const csrfToken = Cookies.get('csrf_access_token');
      const borrowResponse = await axios.post(`/api/reservations/borrow`,
        payload,
        {
          headers: { 'X-CSRF-TOKEN': csrfToken, },
          withCredentials: true,
        }
      );

      if (borrowResponse.status === 200) {
        fetchData();
        alert('Movie borrowed successfully!');
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
        <div className="border-2 border-gray-700 mt-12 p-6 rounded-lg">
          {error && <p className="mb-4 text-red-600">{error}</p>}
          {(!movieInfo || !reservationLoaded) && (
            <p>Loading reservation info...</p>
          )}
          {movieInfo && reservationLoaded && (
            <>
              <p className="text-lg mb-4">Reservation Information for {movieInfo.title}</p>
              <ul>
                {movieInfo.copies !== 0 ? (
                  <li>✔️ Copies left: {movieInfo.copies}</li>
                ) : (
                  <li>❌ Copies left: {movieInfo.copies}</li>
                )}
                {reservationInfo.length === 0 ? (
                  <li>✔️ Currently not borrowing this movie!</li>
                ) : (
                  <li>❌ Currently borrowing this movie.</li>
                )}
              </ul>
              {(movieInfo.copies !== 0 && reservationInfo.length === 0) ? (
                <>
                  <p className="mt-4 text-green-600">Able to borrow this movie!</p>
                  <button 
                    className="bg-green-600 mt-4 px-3 py-1 rounded hover:bg-green-900"
                    onClick={handleBorrow}
                  >
                    Borrow
                  </button>
                </>
              ): (
                <p className="mt-4 text-red-600">Unable to borrow this movie!</p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}