import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

function Profile() {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState({
    firstname: '',
    lastname: '',
    emailid: '',
    phoneno: '',
    auth_method: '', // Added auth_method
  });

  // Fetch profile data
  const fetchProfile = async () => {
    try {
      const response = await fetch('http://localhost:2000/auth/profile', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setProfileData(data.profile);
      } else {
        console.error('Failed to fetch profile data');
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:2000/auth/logout', {
        method: 'GET',
        credentials: 'include', 
      });
  
      if (response.ok) {
        console.log('Logged out successfully');
        navigate('/login'); // Redirect to login page
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  // Use useEffect to fetch profile data on component mount
  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <div className="profile-container">
      <h1>Profile Page</h1>

      <div className="profile-info">
        <div className="name-row">
          <span>First Name: {profileData.firstname}</span>
        </div>

        <div className="name-row">
          <span>Last Name: {profileData.lastname}</span>
        </div>

        <div className="email-row">
          <span>Email: {profileData.emailid}</span>
        </div>

        {/* Conditionally render phone based on auth_method */}
        {profileData.auth_method !== 'google' && (
          <div className="phone-row">
            <span>Phone: {profileData.phoneno}</span>
          </div>
        )}

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}

export default Profile;
