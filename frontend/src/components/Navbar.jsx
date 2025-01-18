// components/Navbar.jsx
'use client';

import React, { useContext } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthContext } from './AuthContext';
import axios from 'axios';
import Cookies from 'js-cookie';

export default function NavBar() {
  const { auth, setAuth } = useContext(AuthContext);
  const router = useRouter();

  const handleLogout = () => {
    axios.post(`/api/auth/logout`, {}, { withCredentials: true })
      .then((response) => {
        console.log('Logout successful:', response.data.msg);
        setAuth({
          isAuthenticated: false,
          user: null,
          loading: false,
        });
        router.push('/'); // Navigate to homepage after logging out
      })
      .catch((error) => {
        console.error('Logout error:', error.response);
      });
  };

  return (
    <nav className="fixed top-0 left-0 w-full h-20 default-background shadow-md flex items-center justify-between px-6 z-50">
      <Link href="/" className="text-3xl font-bold text-red-600 font-bebas">
        CineVault
      </Link>

      <div className="space-x-6">
        <Link href="/" className="text-white hover:text-red-600">
          Home
        </Link>

        {!auth.loading && !auth.isAuthenticated && (
          <>
            <Link href="/login" className="text-white hover:text-red-600">
              Login
            </Link>
            <Link href="/register" className="text-white hover:text-red-600">
              Register
            </Link>
          </>
        )}

        {!auth.loading && auth.isAuthenticated && (
          <>
            <Link href="/movies" className="text-white hover:text-red-600">
              Movies
            </Link>
            <Link href="/borrow" className="text-white hover:text-red-600">
              Borrow
            </Link>
            <Link href="/return" className="text-white hover:text-red-600">
              Return
            </Link>
            <Link href="/profile" className="text-white hover:text-red-600">
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="text-white hover:text-red-600 focus:outline-none"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
