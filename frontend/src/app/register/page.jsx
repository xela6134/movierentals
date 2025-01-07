// app/register/page.jsx
'use client';

import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/components/AuthContext';

export default function Register() {
  const router = useRouter();
  const { auth, setAuth } = useContext(AuthContext);

  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');

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

  const validateInputs = () => {
    if (userId.trim() === '') {
      setError("User ID is blank!");
      return false;
    }
    if (password.trim() === '') {
      setError("Password is blank!");
      return false;
    }
    if (name.trim() === '') {
      setError("Name is blank!");
      return false;
    }
    if (name.length > 20) {
      setError("Your name is too long.");
      return false;
    }
    if (age === '' || isNaN(age) || age <= 0 || age > 120) {
      setError("Age must be a valid number between 1 and 120!");
      return false;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return false;
    }
    return true;
  }

  // Form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateInputs()) {
      return;
    }

    setError('');
    setSuccess('');

    const payload = {
      user_id: userId,
      password: password,
      name: name,
      age: age,
    };

    axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, payload)
      .then((response) => {
        console.log('Registration successful:', response.data);
        setSuccess('Registration successful! Redirecting to login...');
        
        setTimeout(() => {
          router.push('/login');
        }, 1500);
      })
      .catch((error) => {
        // Handle errors
        console.error('Registration error:', error.response);
        if (error.response && error.response.data && error.response.data.msg) {
          setError(error.response.data.msg);
        } else {
          setError('An error occurred during registration. Please try again.');
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
          <h1 className="text-3xl text-center font-kanit text-red-600 mb-6">REGISTER</h1>
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
            <div className="mb-4">
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
            <div className="mb-4">
              <label htmlFor="confirmPassword" className="block text-white mb-2">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full p-2 rounded focus:outline-none"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="name" className="block text-white mb-2">Name</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full p-2 rounded focus:outline-none"
              />
            </div>
            <div className="mb-6">
              <label htmlFor="age" className="block text-white mb-2">Age</label>
              <input
                type="number"
                id="age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                required
                className="w-full p-2 rounded focus:outline-none"
                min="1"
                max="120"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-red-600 text-white p-2 rounded hover:bg-red-900 transition-colors"
            >
              Register
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
