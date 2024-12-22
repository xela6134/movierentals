import React from 'react';
import { Link } from 'react-router-dom';

export default function NavBar() {
  return (
    <nav className="fixed top-0 left-0 w-full h-20 default-background shadow-md flex items-center justify-between px-6 z-50">
      <Link to="/" className="text-3xl font-bold text-red-600 font-bebas">
        CineVault
      </Link>

      <div className="space-x-6">
        <Link to="/" className="text-white hover:text-red-600">
          Home
        </Link>
        <Link to="/login" className="text-white hover:text-red-600">
          Login
        </Link>
        <Link to="/register" className="text-white hover:text-red-600">
          Register
        </Link>
      </div>
    </nav>
  );
}
