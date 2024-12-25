// app/page.jsx
'use client';

import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '@/components/AuthContext';
import axios from 'axios';

export default function Root() {
  const { auth, setAuth } = useContext(AuthContext);
  const [username, setUsername] = useState('');

  useEffect(() => {
    if (auth.isAuthenticated) {
      axios
        .get(`${process.env.NEXT_PUBLIC_API_URL}/users/username`, { withCredentials: true })
        .then((response) => {
          setUsername(response.data.username);
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }, [auth.isAuthenticated]);

  return (
    <div className="h-[calc(100vh-80px)] flex items-center justify-center default-background">
      <div className="rounded-lg secondary-background p-6">
        <h1 className="text-3xl text-white text-center">Welcome!</h1>
        <br />
        {!auth.loading && !auth.isAuthenticated && (
          <p className="text-white">Login or Register to borrow our variety of DVDs.</p>
        )}
        {!auth.loading && auth.isAuthenticated && (
          <p className="text-white">What would you like to do today, {username}?</p>
        )}
      </div>
    </div>
  );
}
