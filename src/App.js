import React, { useState, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './components/Home';
import LoginSignup from './components/LoginSignUp';
import './App.css';
import Profile from './components/Profile';
import Record from './components/Record';

function App() {
  return (
   <GoogleOAuthProvider>
    <AuthProvider>
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/loginSignUp" element={<LoginSignup />} /> {/* Route for Login/Signup */}
        <Route path="/profile" element={<Profile />} /> {/* Route for Login/Signup */}
        <Route path="/record" element={<Record />} /> {/* Route for Login/Signup */}
        <Route path="*" element={<Navigate to="/" />} /> {/* Redirect to home for undefined paths */}
      </Routes>
    </Router>
    </AuthProvider>
   </GoogleOAuthProvider>
    
  );
}

export default App;