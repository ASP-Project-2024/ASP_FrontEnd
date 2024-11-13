import React from 'react';
import { useLocation } from 'react-router-dom';
import './Profile.css';

function Profile() {
  const location = useLocation();
  const { firstName, lastName, email, phone } = location.state || {}; // Access the passed user data

  const handleLogout = () => {
    console.log('User logged out');
    // Clear session or token and navigate to the login page
    // Optionally use useNavigate for redirection
  };

  return (
    <div className="profile-container">
      <h1>Profile Page</h1>

      <div className="profile-info">
        <div className="name-row">
          <span>First Name: {firstName}</span>
        
        </div>

        <div className="name-row">
        <span>Last Name: {lastName}</span>
        </div>


        <div className="email-row">
          <span>Email: {email}</span>
        </div>

        <div className="phone-row">
          <span>Phone: {phone}</span>
        </div>

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}

export default Profile;
