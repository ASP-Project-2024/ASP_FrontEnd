import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

function Profile() {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState({
    firstname: 'firstname', // Placeholder for testing
    lastname: 'lastname', // Placeholder for testing
    emailid: 'emailid@emailid.com', // Placeholder for testing
    phoneno: '123-456-7890', // Placeholder for testing
    applicationNumber: 'APP12345', // Placeholder for testing
    auth_method: 'email', // Placeholder for testing
  });

  useEffect(() => {
    // Uncomment and configure the API request when it's available
    /*
    const fetchProfile = async () => {
      try {
        const response = await fetch('http://localhost:2000/auth/profile', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
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

    fetchProfile();
    */
  }, []);

  return (
    <div className="profile-container">
      {/* Profile Picture */}
      <div className="profile-header">
        <div className="profile-picture">
          <img
            className="profile-img"
            src="https://via.placeholder.com/150"
            alt="Profile"
          />
        </div>
      </div>

      {/* Profile Info */}
      <div className="profile-details">
        <h1 className="welcome-message">Welcome,</h1>
        <h2 className="name">{profileData.firstname} {profileData.lastname}</h2>
        <div className="bio">
          <p><strong>Email Id :</strong> {profileData.emailid}</p>
          <p><strong>Phone:</strong> {profileData.phoneno}</p>
          <p><strong>Application Number:</strong> {profileData.applicationNumber}</p>
        </div>
        {/* Logout Button below application number */}
        <button
          className="logout-btn"
          onClick={() => navigate('/logout')}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Profile;