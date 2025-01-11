// app/profile/page.jsx
'use client';

import { AuthContext } from '@/components/AuthContext';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import React, { useContext, useEffect, useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import Cookies from 'js-cookie';

export default function User() {
  const { auth } = useContext(AuthContext);
  const router = useRouter();

  const [userInfo, setUserInfo] = useState(null);
  const [error, setError] = useState('');

  // States for updating profile
  const [updateProfile, setUpdateProfile] = useState(false);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [password, setPassword] = useState('');

  // States for updating movies
  const [movies, setMovies] = useState([]);
  const [borrowing, setBorrowing] = useState([]);
  const [reviews, setReviews] = useState([]);

  // States for password confirmation
  const [isPasswordConfirmed, setIsPasswordConfirmed] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // State to toggle password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  // Async function to fetch all data
  const fetchData = async () => {
    try {
      // Fetch current user's ID
      const idResponse = await axios.get(`/api/users/currid`, {
        withCredentials: true,
      });
      const userId = idResponse.data.id;

      // Fetch user information using the obtained ID
      const infoResponse = await axios.get(`/api/users/${userId}`, {
        withCredentials: true,
      });
      setUserInfo(infoResponse.data);

      const moviesResponse = await axios.get(`/api/movies`, {
        withCredentials: true,
      })
      setMovies(moviesResponse.data);

      const borrowingResponse = await axios.get(`/api/reservations/user/${userId}`, { 
        withCredentials: true 
      });
      setBorrowing(borrowingResponse.data);

      const reviewsResponse = await axios.get(`/api/reviews/user/${userId}`, {
        withCredentials: true
      });
      setReviews(reviewsResponse.data);
    } catch (error) {
      console.error(error);
      setError('Failed to load user information.');
      setTimeout(() => {
        router.push('/');
      }, 1500);
    }
  };

  // Handle password confirmation
  const handlePasswordConfirm = async (e) => {
    e.preventDefault();
    setPasswordError('');

    try {
      const response = await axios.get(`/api/auth/validate`, {
        params: { password: passwordInput },
        withCredentials: true,
      });

      if (response.status === 200) {
        setIsPasswordConfirmed(true);
        setUpdateProfile(true);
        setPasswordInput('');
      }
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.msg) {
        setPasswordError(err.response.data.msg);
      } else {
        setPasswordError('An error occurred during password validation. Please try again.');
      }
    }
  };

  // Handler for initiating profile update (after password confirmation)
  const initiateProfileUpdate = () => {
    setUpdateProfile(true);
    setIsPasswordConfirmed(false);
    setPasswordError('');
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const payload = {
        name: name,
        age: age,
        password: password
      };

      const csrfToken = Cookies.get('csrf_access_token');

      // Update user information
      const response = await axios.post(`/api/auth/update`,
        payload,
        {
          headers: { 'X-CSRF-TOKEN': csrfToken, },
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        fetchData();
        setUpdateProfile(false);
        setIsPasswordConfirmed(false);
        setPassword('');
        alert('Profile updated successfully!');
      }
    } catch (err) {
      console.error(err);
      setError(err.response.data.msg);
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

                  {!updateProfile && (
                    <button
                      className="w-2/5 bg-red-600 text-white px-3 py-1 rounded hover:bg-red-900"
                      onClick={initiateProfileUpdate}
                    >
                      Update Profile
                    </button>
                  )}

                  {updateProfile && !isPasswordConfirmed && (
                    <div className="w-full">
                      <h2 className="text-2xl mb-4">Confirm Your Password</h2>
                      {passwordError && <div className="mb-4 text-red-600">{passwordError}</div>}
                      <form onSubmit={handlePasswordConfirm}>
                        <div className="mb-4 relative">
                          <label htmlFor="confirmPassword" className="block mb-2">Password</label>
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            id="confirmPassword"
                            value={passwordInput}
                            onChange={(e) => setPasswordInput(e.target.value)}
                            required
                            className="w-full p-2 rounded focus:outline-none text-black pr-10"
                          />
                          <span
                            className="absolute top-12 right-3 flex items-center cursor-pointer"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? 
                              <FaEyeSlash className="text-black"/> 
                            : 
                              <FaEye className="text-black"/>
                            }
                          </span>
                        </div>
                        <div className="flex gap-4">
                          <button
                            type="submit"
                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-900"
                          >
                            Confirm
                          </button>
                          <button
                            type="button"
                            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-900"
                            onClick={() => {
                              setUpdateProfile(false);
                              setPasswordError('');
                              setPasswordInput('');
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {updateProfile && isPasswordConfirmed && (
                    <form onSubmit={handleProfileUpdate}>
                      <div className="mb-4 relative">
                        <label htmlFor="name" className="block mb-2">Name</label>
                        <input
                          type="text"
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full p-2 rounded focus:outline-none text-black"
                          placeholder={userInfo.name}
                        />
                      </div>
                      <div className="mb-4 relative">
                        <label htmlFor="age" className="block mb-2">Age</label>
                        <input
                          type="number"
                          id="age"
                          value={age}
                          onChange={(e) => setAge(e.target.value)}
                          className="w-full p-2 rounded focus:outline-none text-black"
                          placeholder={userInfo.age}
                          min="1"
                          max="120"
                        />
                      </div>
                      <div className="mb-4 relative">
                        <label htmlFor="password" className="block mb-2">New Password</label>
                        <input
                          type={showPassword ? "text" : "password"}
                          id="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full p-2 rounded focus:outline-none text-black pr-10"
                          placeholder="Leave blank to keep current password"
                        />
                        <span
                          className="absolute top-12 right-3 flex items-center cursor-pointer"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? 
                            <FaEyeSlash className="text-black"/> 
                          : 
                            <FaEye className="text-black"/>
                          }
                        </span>
                      </div>
                      <div className="flex gap-4">
                        <button
                          type="submit"
                          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-900"
                        >
                          Save Changes
                        </button>
                        <button
                          type="button"
                          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-900"
                          onClick={() => {
                            setUpdateProfile(false);
                            setIsPasswordConfirmed(false);
                            setPasswordError('');
                            setName('');
                            setAge('');
                            setPassword('');
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            ) : (
              <div>Loading your information...</div>
            )}
          </div>
          <div className="w-1/2 h-full flex flex-col items-center">
            <div className="text-3xl mt-4 mb-6 pb-4 border-b-2 border-gray-400">
              Currently Borrowing
            </div>
            {borrowing.length > 0 ? (
              borrowing.map((curr, index) => {
                const movieName = movies.find(m => m.id === curr.m_id);
                return (
                  <div className="w-4/5 bg-gray-800 p-4 rounded shadow-md" key={`${userInfo.id}-${index}`}>
                    <p>Movie: {movieName}</p>
                    <p>Borrowed on: {curr.reservationDate}</p>
                  </div>
                )
              })
            ) : (
              <p className="text-gray-400">Currently not borrowing any movies!</p>
            )}
            <div className="text-3xl mt-12 mb-6 pb-4 border-b-2 border-gray-400">
              Previously Borrowed
            </div>
            {reviews.length > 0 ? (
              reviews.map((review, index) => {
                const movie = movies.find(m => m.id === review.m_id);
                return (
                  <div
                    key={`${review.u_id}-${index}`}
                    className="w-11/12 bg-gray-800 p-4 rounded shadow-md mb-4"
                  >
                    <p className="text-lg font-semibold mb-2">
                      {movie ? movie.title : 'Unknown Movie'}
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
              <p className="text-gray-400">No movies borrowed yet!</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
