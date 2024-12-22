'use client'

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Root from "@/pages/Root";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import NavBar from "@/components/Navbar";

export default function Home() {
  return (
    <BrowserRouter>
      <NavBar />
      {/* Add padding-top to prevent content from being hidden behind the NavBar */}
      <div className="pt-20">
        <Routes>
          <Route path="/" element={<Root />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
