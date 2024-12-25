import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import axios from 'axios';

export default function NavBar() {
  const { auth, setAuth } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {}, { withCredentials: true })
      .then((response) => {
        console.log('Logout successful:', response.data.msg);
        setAuth({
          isAuthenticated: false,
          user: null,
          loading: false,
        });
        navigate('/');// Navigate to homepage after logging out
      })
      .catch((error) => {
        console.error('Logout error:', error.response);
      });
  };

  return (
    <nav className="fixed top-0 left-0 w-full h-20 default-background shadow-md flex items-center justify-between px-6 z-50">
      <Link to="/" className="text-3xl font-bold text-red-600 font-bebas">
        CineVault
      </Link>

      <div className="space-x-6">
        <Link to="/" className="text-white hover:text-red-600">
          Home
        </Link>

        {!auth.loading && !auth.isAuthenticated && (
          <>
            <Link to="/login" className="text-white hover:text-red-600">
              Login
            </Link>
            <Link to="/register" className="text-white hover:text-red-600">
              Register
            </Link>
          </>
        )}

        {!auth.loading && auth.isAuthenticated && (
          <button
            onClick={handleLogout}
            className="text-white hover:text-red-600 focus:outline-none"
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}
