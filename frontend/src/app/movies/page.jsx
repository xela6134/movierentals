// app/movies/page.jsx
'use client';

import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '@/components/AuthContext';
import { useRouter } from 'next/navigation';

export default function Movies() {
  const { auth, setAuth } = useContext(AuthContext);
  const [redirecting, setRedirecting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!auth.loading) {
      if (!auth.isAuthenticated) {
        setRedirecting(true);
        setTimeout(() => {
          router.push('/');
        }, 1500);
      }
    }
  }, [auth.loading, auth.isAuthenticated, router]);

  return (
    <div className="min-h-screen default-background text-white">
      <h1 className="text-center text-3xl">Movies</h1>
      {!auth.loading && auth.isAuthenticated && (
        <div>
          List of movies
        </div>
      )}
      {!auth.loading && !auth.isAuthenticated && (
        <div>
          Not allowed to view movies. Redirecting to home page...
        </div>
      )}
    </div>
  )
}
