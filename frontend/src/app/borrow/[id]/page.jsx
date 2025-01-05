// src/app/borrow/[id]/page.jsx
'use client';

import { useParams } from 'next/navigation';
import React from 'react';

export default function BorrowSpecific() {
  const params = useParams();

  const movieId = params.id;

  return (
    <div className="flex flex-col items-center justify-center default-background bg-red-500 text-white w-full">
      <div className="bg-red-600 w-3/4">
        Default specific borrow page for {movieId}
      </div>
    </div>
  )
}