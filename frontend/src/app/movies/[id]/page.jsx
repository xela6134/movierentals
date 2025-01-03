// src/app/movies/[id]/page.jsx
'use client';

import React, { useEffect, useState, useContext } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import { AuthContext } from '@/components/AuthContext';

export default function MovieDetail() {
  const { auth, setAuth } = useContext(AuthContext);
  const router = useRouter();
  const params = useParams();
  const movieId = params.id;

  useEffect(() => {
    if (!auth.loading) {
      if (!auth.isAuthenticated) {
        setTimeout(() => {
          router.push('/');
        }, 1500);
      }
    }
  }, [auth.loading, auth.isAuthenticated, router])

  return (
    <div className="min-h-screen flex items-center justify-start flex-col default-background text-white">
      {!auth.loading && !auth.isAuthenticated && (
        <div>Not allowed to view movie. Redirecting to home page...</div>
      )}
      {!auth.loading && auth.isAuthenticated && (
        <div className="text-center text-3xl text-white">Movie for id {movieId}</div>
      )}
    </div>
  );
}