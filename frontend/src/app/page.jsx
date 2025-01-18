// app/page.jsx
'use client';

import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '@/components/AuthContext';
import axios from 'axios';

export default function Root() {
  const { auth } = useContext(AuthContext);

  useEffect(() => {
    if (!auth.loading && auth.isAuthenticated) {
      fetchData();
    }
  }, [auth.loading, auth.isAuthenticated]);

  const fetchData = async () => {
    
  };

  return (
    <div className="h-[calc(100vh-80px)] flex items-center justify-center default-background">
      <div className="rounded-lg secondary-background p-6">
        <h1 className="text-3xl text-white text-center">Welcome!</h1>
        <br />
        {!auth.loading && !auth.isAuthenticated && (
          <p className="text-white text-center">Login or Register to borrow our variety of DVDs.</p>
        )}
        {!auth.loading && auth.isAuthenticated && (
          <p className="text-white text-center">Whats up</p>
        )}
      </div>
    </div>
  );
}
