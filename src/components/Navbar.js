import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

function Navbar({ startRecording, stopRecording, isRecording }) {
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isRecordDropdownOpen, setIsRecordDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const toggleRecordDropdown = () => {
    setIsRecordDropdownOpen(!isRecordDropdownOpen);
  };

  const handleLoginClick = () => {
    setIsProfileDropdownOpen(false);
    navigate('/loginSignUp');
  };

  return (
    <nav className="navbar">
      <ul className="navList">
        <li className="navItem">
          <Link to="/" className="navLink">Home</Link>
        </li>
        <li className="navItem">
          <div className="dropdown">
            <button className="dropbtn" onClick={toggleProfileDropdown}>Profile</button>
            {isProfileDropdownOpen && (
              <div className="dropdownContent">
                <button onClick={handleLoginClick} className="dropdownContentLink">Login</button>
              </div>
            )}
          </div>
        </li>
        <li className="navItem">
          <div className="dropdown">
            <button className="dropbtn" onClick={toggleRecordDropdown}>Record</button>
            {isRecordDropdownOpen && (
              <div className="dropdownContent">
                <button onClick={startRecording} disabled={isRecording} className="dropdownContentLink">Start Recording</button>
                <button onClick={stopRecording} disabled={!isRecording} className="dropdownContentLink">Stop Recording</button>
              </div>
            )}
          </div>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
