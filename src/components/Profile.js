import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './Profile.css';

function Profile() {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState({
    firstname: '',
    lastname: '',
    emailid: '',
    phoneno: '',
    auth_method: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/auth/profile`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setProfileData({
            firstname: data.profile.firstname || '',
            lastname: data.profile.lastname || '',
            emailid: data.profile.emailid || '',
            phoneno: data.profile.phoneno || '',
            auth_method: data.profile.auth_method || '',
          });
        } else {
          console.error('Failed to fetch profile data');
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
      }
    };
    fetchProfile();
  }, []);

  const  handleLogout = async () => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You will be logged out.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#007bff',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, log me out!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/auth/logout`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
          });
          if(response.ok) {
            navigate('/');
          } else {
            console.error('Failed to logout');
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: 'Something went wrong!',
          }
          );
          }

        } catch (error) {
          console.error('Error fetching profile data:', error);
        }
      
      }
    });
  };

  const getInitials = () => {
    const { firstname, lastname } = profileData;
    return `${firstname.charAt(0)}${lastname.charAt(0)}`.toUpperCase();
  };

  const getRandomColor = () => {
    const colors = [
      '#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#A133FF', '#FFD733',
      '#33FFF2', '#7D3C98', '#148F77', '#E74C3C', '#F1C40F', '#1F618D',
      '#28B463', '#641E16', '#F39C12', '#9B59B6', '#16A085', '#D35400',
      '#BDC3C7', '#7FB3D5', '#D5DBDB', '#34495E', '#2ECC71', '#E67E22',
      '#2980B9', '#F0B27A', '#CA6F1E', '#2E4053', '#5499C7', '#1ABC9C',
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  return (
    <div className="profile-container">
      <div
        className="profile-picture-initials"
        style={{ backgroundColor: getRandomColor() }}
      >
        <span>{getInitials()}</span>
      </div>
      <div className="profile-details">
        <h1 className="welcome-message">
          Hello {profileData.firstname} {profileData.lastname}
        </h1>
        <div className="bio">
          <p><strong>Email:</strong> {profileData.emailid}</p>
          {profileData.auth_method !== 'google' && (
            <p><strong>Phone:</strong> {profileData.phoneno}</p>
          )}
        </div>
        <button
          className="logout-btn"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Profile;
