import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Import Link for navigation
import './Navbar.css';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  const closeMenu = () => {
    setIsOpen(false); // Close the menu
  };

  return (
    <nav className="navbar">
      {/* Logo that redirects to the home page */}
      <Link to="/" className="navbar-logo">InterviewPrep</Link>
      <div className={`navbar-links ${isOpen ? 'open' : ''}`}>
      <Link to="/profile" onClick={closeMenu}>Profile</Link>
        <Link to="/loginSignUp" onClick={closeMenu}>Login</Link>
        <Link to="/record" onClick={closeMenu}>Record</Link>
      </div>
      <div className="hamburger" onClick={toggleMenu} >
        <span></span>
        <span></span>
        <span></span>
      </div>
    </nav>
  );
}

export default Navbar;
