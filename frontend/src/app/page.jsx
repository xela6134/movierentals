'use client'

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Root from "@/pages/Root";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import NavBar from "@/components/Navbar";
import Movies from "@/pages/Movies";
import { AuthProvider } from "@/components/AuthContext";

export default function Home() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <NavBar />
        <div className="pt-20">
          <Routes>
            <Route path="/" element={<Root />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/movies" element={<Movies />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
