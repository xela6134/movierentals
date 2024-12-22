import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();

  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    setError('');
    setSuccess('');

    const payload = {
      user_id: userId,
      password: password,
    };

    axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/login`, payload)
      .then((response) => {
        console.log('Login successful:', response.data);
        setSuccess('Login successful! Redirecting...');
        
        // TODO: Handle token storage here (e.g., store in cookies or localStorage)
        // For example, if the backend sends a token in the response:
        // const { token } = response.data;
        // localStorage.setItem('token', token);

        setTimeout(() => {
          navigate('/');
        }, 1500);
      })
      .catch((error) => {
        console.error('Login error:', error.response);
        if (error.response && error.response.data && error.response.data.msg) {
          setError(error.response.data.msg);
        } else {
          setError('Error occurred.');
        }
      });
  };

  return (
    <div className="h-[calc(100vh-80px)] flex items-center justify-center default-background">
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
    </div>
  );
}
