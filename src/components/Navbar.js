import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Import Link for navigation
import './Navbar.css';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="navbar">
      {/* Logo that redirects to the home page */}
      <Link to="/" className="navbar-logo">ASP Project</Link>
      <div className={`navbar-links ${isOpen ? 'open' : ''}`}>
      <Link to="/profile">Profile</Link>
        <Link to="/loginSignUp">Login</Link>
        <Link to="/record">Record</Link>
      </div>
      <div className="hamburger" onClick={toggleMenu}>
        <span></span>
        <span></span>
        <span></span>
      </div>
    </nav>
  );
}

export default Navbar;
