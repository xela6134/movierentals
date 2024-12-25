// app/layout.jsx
'use client';

import './globals.css';
import Navbar from "@/components/Navbar";
import { AuthProvider } from "@/components/AuthContext";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navbar />
          <div className="pt-20">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
