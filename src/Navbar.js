// Navbar.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import './Navbar.css';

function Navbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate(); // Initialize navigate

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLoginClick = () => {
    setIsDropdownOpen(false); // Close the dropdown before navigating
    navigate('/loginSignUp'); // Redirect to the LoginSignUp page
  };

  return (
    <nav className="navbar">
      <ul className="navList">
        <li className="navItem">
          <Link to="/" className="navLink">Home</Link>
        </li>
        <li className="navItem">
          <div className="dropdown">
            <button className="dropbtn" onClick={toggleDropdown}>Profile</button>
            {isDropdownOpen && (
              <div className="dropdownContent">
                <button onClick={handleLoginClick} className="dropdownContentLink">Login</button>
              </div>
            )}
          </div>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
