// app/login/page.jsx
'use client';

import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/components/AuthContext';

export default function Login() {
  const router = useRouter();
  const { auth, setAuth } = useContext(AuthContext);

  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!auth.loading) {
      if (auth.isAuthenticated) {
        setTimeout(() => {
          router.push('/');
        }, 1500);
      }
    }
  }, [auth.loading, auth.isAuthenticated, router])

  const handleSubmit = (e) => {
    e.preventDefault();

    setError('');
    setSuccess('');

    const payload = {
      user_id: userId,
      password: password,
    };

    axios.post(`/api/auth/login`, payload, { withCredentials: true })
      .then((response) => {
        console.log('Login successful:', response.data);
        setSuccess('Login successful! Redirecting...');

        axios.get(`/api/auth/status`, { withCredentials: true })
          .then((res) => {
            setAuth({
              isAuthenticated: res.data.authenticated,
              user: res.data.user,
              loading: false,
            });
          })
          .catch((err) => {
            console.error('Auth status error:', err.response);
            setAuth({
              isAuthenticated: false,
              user: null,
              loading: false,
            });
          });

        setTimeout(() => {
          router.push('/');
        }, 1500);
      })
      .catch((error) => {
        console.error(error);
        if (error.response && error.response.data && error.response.data.msg) {
          setError(error.response.data.msg);
        } else {
          setError('An error occurred during login. Please try again.');
        }
      });
  };

  return (
    <div className="min-h-screen flex items-center justify-center default-background">
      {!auth.loading && auth.isAuthenticated && (
        <div className="text-white text-2xl">You are already logged in! Redirecting to home page...</div>
      )}
      {!auth.loading && !auth.isAuthenticated && (
        <div className="rounded-lg secondary-background p-16">
          <h1 className="text-3xl text-center font-kanit text-red-600 mb-6">LOGIN</h1>
          {/* Display success or error message */}
          {success && <div className="mb-4 max-w-[208px] text-green-400">{success}</div>}
          {error && <div className="mb-4 max-w-[208px] text-red-400">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="userId" className="block text-white mb-2">User ID</label>
              <input
                type="text"
                id="userId"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                required
                className="w-full p-2 rounded focus:outline-none"
              />
            </div>
            <div className="mb-6">
              <label htmlFor="password" className="block text-white mb-2">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full p-2 rounded focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-red-600 text-white p-2 rounded hover:bg-red-900 transition-colors"
            >
              Login
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
