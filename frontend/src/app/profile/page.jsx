'use client';

import { AuthContext } from '@/components/AuthContext';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import React, { useContext, useEffect, useState } from 'react';

export default function User() {
  const { auth } = useContext(AuthContext);
  const router = useRouter();

  const [userInfo, setUserInfo] = useState(null);
  const [error, setError] = useState('');
  const [updateProfile, setUpdateProfile] = useState(false);

  // For editing profile
  const [name, setName] = useState('');
  const [age, setAge] = useState('');

  useEffect(() => {
    if (!auth.loading) {
      if (!auth.isAuthenticated) {
        setTimeout(() => {
          router.push('/');
        }, 1500);
      } else {
        fetchUserData();
      }
    }
  }, [auth.loading, auth.isAuthenticated, router]);

  // Async function to fetch user ID and then user information
  // Used instead of promises
  const fetchUserData = async () => {
    try {
      // Fetch current user's ID
      const idResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/users/currid`, {
        withCredentials: true,
      });
      const userId = idResponse.data.id;

      // Fetch user information using the obtained ID
      const infoResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`, {
        withCredentials: true,
      });
      setUserInfo(infoResponse.data);
    } catch (error) {
      console.error(error);
      setError('Failed to load user information.');
      setTimeout(() => {
        router.push('/');
      }, 1500);
    }
  };

  return (
    <div className="flex items-center w-full justify-start flex-col default-background text-white p-4 min-h-screen">
      {!auth.loading && !auth.isAuthenticated && (
        <div>You have not logged in. Redirecting to home page...</div>
      )}
      {!auth.loading && auth.isAuthenticated && (
        <div className="w-full h-screen flex">
          <div className="w-1/2 h-full flex flex-col items-center">
            <div className="text-3xl mt-4 mb-6">Your Profile</div>
            {error && <div className="mb-4 text-red-600">{error}</div>}
            {userInfo ? (
              <div className="flex flex-row w-full">
                <div className="w-1/2 flex flex-col justify-center items-center p-4 gap-4">
                  {/* Implement profile image database sometime when finishing this */}
                  <img
                    src="/images/default_user.jpg"
                    alt="User Image"
                    className="w-3/5 h-auto rounded-full"
                  />
                </div>
                <div className="w-1/2 p-4 text-white text-xl flex flex-col gap-6">
                  <p>
                    <strong>ID:</strong> {userInfo.id}
                  </p>
                  <p>
                    <strong>Name:</strong> {userInfo.name}
                  </p>
                  <p>
                    <strong>Age:</strong> {userInfo.age}
                  </p>
                  {userInfo.isAdmin ? (
                    <p>
                      <strong>User Status:</strong> Admin
                    </p>
                  ) : (
                    <p>
                      <strong>User Status:</strong> Default User
                    </p>                
                  )}
                  {userInfo.suspended ? (
                    <p>
                      <strong>Suspension Status:</strong> <span className="text-red-400">Suspended</span>
                    </p>   
                  ) : (
                    <p>
                      <strong>Suspension Status:</strong> <span className="text-green-400">Not Suspended</span>
                    </p>
                  )}
                  {updateProfile ? (
                    <form>
                      <label htmlFor="userId" className="block mb-2">Name</label>
                      <input
                        type="text"
                        id="userId"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full mb-4 p-2 rounded focus:outline-none text-black"
                      />
                      <label htmlFor="age" className="block mb-2">Age</label>
                      <input
                        type="number"
                        id="age"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        required
                        className="w-full mb-4 p-2 rounded focus:outline-none text-black"
                        min="1"
                        max="120"
                      />
                    </form>
                  ) : (
                    <button 
                      className="w-2/5 bg-red-600 text-white px-3 py-1 rounded hover:bg-red-900"
                      onClick={() => { setUpdateProfile(true) }}
                    >
                      Update profile
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div>Loading user information...</div>
            )}
          </div>
          <div className="w-1/2 h-full flex flex-col items-center bg-gray-400">
            <div className="text-3xl mt-4 mb-6">
              Your Movies
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
