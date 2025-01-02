// src/app/movies/[id]/page.jsx
'use client';

import React, { useEffect, useState, useContext } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import { AuthContext } from '@/components/AuthContext';

export default function MovieDetail() {
  const { auth } = useContext(AuthContext);
  const router = useRouter();
  const params = useParams();
  const movieId = params.id;
  
  return (
    <div className="min-h-screen flex items-center justify-start flex-col default-background text-white">
      <p className="text-center text-3xl text-white">Movie for id {movieId}</p>
    </div>
  );
}