import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// Create auth context
export const AuthContext = createContext();

// Create auth provider
export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    user: null,
    loading: true,
  });

  useEffect(() => {
    const checkAuthStatus = () => {
      axios.get(`${process.env.NEXT_PUBLIC_API_URL}/auth/status`, { withCredentials: true })
        .then((response) => {
          setAuth({
            isAuthenticated: true,
            user: response.data.user,
            loading: false,
          });
        })
        .catch((error) => {
          console.log(error);
          setAuth({
            isAuthenticated: false,
            user: null,
            loading: false,
          });
        });
    };

    checkAuthStatus();
  }, []);

  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
