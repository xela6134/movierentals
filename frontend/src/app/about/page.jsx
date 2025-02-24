// app/about/page.jsx
'use client'

import { AuthContext } from '@/components/AuthContext';
import React, { useContext, useState, useEffect } from 'react';
import { FaGithub } from 'react-icons/fa';

export default function About() {
  const { auth } = useContext(AuthContext);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    if (!auth.loading) {
      if (!auth.isAuthenticated) {
        setLoggedIn(false);
      }
    }
  }, [auth.loading, auth.isAuthenticated]);

  return (
    <div className="flex flex-col items-center w-full justify-start default-background text-white p-8 gap-8">
      <div className="w-full border-2 border-white rounded-lg p-4 min-h-40">
        <h1 className="text-3xl mb-2">1. What is this website?</h1>
        <p className="text-lg mb-1">Remember those DVD rental shops which went out of business after the rise of OTT platforms like Netflix?</p>
        <p className="text-lg mb-1">I enjoyed visiting those shops, renting 'state-of-the-art' BluRay videos and watching them with my family back in primary school.</p>
        <p className="text-lg mb-1">During my precious time at SNU on exchange, one of my assignments gave me a raw dump file of 1150 review ratings, associated with a movie and a user.</p>
        <p className="text-lg mb-1">I've decided to utilise this database, refine the data, add bits and pieces, then make a fullstack application with this, remembering the good old days.</p>
      </div>
      <div className="w-full border-2 border-white rounded-lg p-4 min-h-40">
        <h1 className="text-3xl mb-2">2. What did you use to create this website?</h1>
        <p className="text-lg mb-1">Backend: Python (Flask)</p>
        <p className="text-lg mb-1">Frontend: Next.js & React</p>
        <p className="text-lg mb-1">Database: MySQL</p>
        <p className="text-lg mb-1">Deployment: Railway (All 3 are deployed on Railway)</p>
        <p className="text-lg mb-1"><strong>P.S.</strong> This website is not mobile responsive - I had other priorities while making this side project.</p>
      </div>
      <div className="w-full border-2 border-white rounded-lg p-4 min-h-40">
        <h1 className="text-3xl mb-2">3. Anything else?</h1>
        <p className="text-lg mb-1">My github repo is down below!</p>
        <p className="text-lg mb-1">If you have any suggestions, register and comment down below!</p>
        <p className="text-lg mb-1">I cannot see any of your passwords because it is encrypted with <code className="bg-gray-700 py-1 px-2 rounded-lg">Flask-Bcrypt</code>.</p>
        <p className="text-lg mb-1">Check the github repo if you cannot believe me</p>
        <a
          href="https://github.com/xela6134/movierentals"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center mt-1 px-4 py-2 bg-gray-600 hover:bg-gray-800 font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75 transition-colors duration-200"
        >
          <FaGithub className="mr-2" size={20} />
          Visit GitHub
        </a>
      </div>
      {loggedIn ? (
        <div className="text-xl">You are logged in.</div>
      ) : (
        <div className="text-xl">You are logged out - log in to leave a comment! (TODO)</div>
      )}
    </div>
  )
}