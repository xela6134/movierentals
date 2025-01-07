'use client';

import { AuthContext } from '@/components/AuthContext';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import React, { useContext, useEffect, useState } from 'react';

export default function User() {
  const { auth, setAuth } = useContext(AuthContext);
  const router = useRouter();

  const [userId, setUserId] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [error, setError] = useState('');

  // Changed to async/await syntax
  useEffect(() => {
    if (!auth.loading) {
      if (!auth.isAuthenticated) {
        setTimeout(() => {
          router.push('/');
        }, 1500);
      } else {
        const fetchUserData = async () => {
          try {
            const id = await fetchUserId();
            await fetchUserInfo(id);
          } catch (err) {
            console.error(err);
            setError('Failed to load user information.');
          }
        };

        fetchUserData();
      }
    }
  }, [auth.loading, auth.isAuthenticated, router]);

  // Async function for fetching user id
  const fetchUserId = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/users/currid`, {
        withCredentials: true,
      });
      const id = response.data.id;
      setUserId(id);
      return id;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  // Async function to fetch user information based on user id
  const fetchUserInfo = async (id) => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}`, {
        withCredentials: true,
      });
      setUserInfo(response.data);
    } catch (error) {
      console.error(error);
      setError('Failed to load user information.');
      throw error;
    }
  };

  return (
    <div className="flex items-center w-full justify-start flex-col default-background text-white p-4">
      {!auth.loading && !auth.isAuthenticated && (
        <div>You have not logged in. Redirecting to home page...</div>
      )}
      {!auth.loading && auth.isAuthenticated && (
        <>
          {error && <div className="mb-4 text-red-600">{error}</div>}
          {userInfo ? (
            <div>
              Welcome user {userId} with name {userInfo.name}!
            </div>
          ) : (
            <div>Loading user information...</div>
          )}
        </>
      )}
    </div>
  );
}
