import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import {jwtDecode} from 'jwt-decode'; // Correctly import default export
import Swal from 'sweetalert2'; // Import SweetAlert2

function LoginSignup() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    emailid: '',
    password: '',
    firstname: '',
    lastname: '',
    phoneno: '',
  });
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const endpoint = isLogin ? 'http://localhost:2000/auth/login' : 'http://localhost:2000/auth/signup';

    const bodyData = isLogin
      ? { emailid: formData.emailid, password: formData.password }
      : {
          firstname: formData.firstname,
          lastname: formData.lastname,
          phoneno: formData.phoneno,
          emailid: formData.emailid,
          password: formData.password,
        };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyData),
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        // Success alert
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: isLogin ? 'Logged in successfully!' : 'Account created successfully!',
          confirmButtonText: 'OK',
        }).then(() => {
          navigate('/home'); // Navigate to home page after success
        });
      } else {
        // Error alert
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: data.error || 'Something went wrong. Please try again.',
          confirmButtonText: 'OK',
        });
      }
    } catch (error) {
      // Network error alert
      Swal.fire({
        icon: 'error',
        title: 'Network Error!',
        text: error.message || 'Please check your connection and try again.',
        confirmButtonText: 'OK',
      });
    }
  };

  const googleLogin = async (credentialResponse) => {
    try {
      const { credential } = credentialResponse;
      const decoded = jwtDecode(credential);

      // Extract user information from the token
      const firstname = decoded.given_name;
      const lastname = decoded.family_name;
      const emailid = decoded.email;

      // Backend endpoint for Google authentication
      const endpoint = isLogin
        ? 'http://localhost:2000/auth/google-login'
        : 'http://localhost:2000/auth/google-signup';

      // Send extracted data to the backend
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ emailid, firstname, lastname }),
      });

      const data = await response.json();

      if (response.ok) {
        // Success alert for Google login/signup
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Google authentication successful!',
          confirmButtonText: 'OK',
        }).then(() => {
          navigate('/home'); // Navigate to home page after success
        });
      } else {
        // Error alert for Google login/signup
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: data.error || 'Google authentication failed. Please try again.',
          confirmButtonText: 'OK',
        });
      }
    } catch (error) {
      // Error alert for decoding or network issues
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Failed to decode Google credentials or network issue occurred.',
        confirmButtonText: 'OK',
      });
    }
  };

  return (
    <GoogleOAuthProvider clientId="1075893040673-0ikvhs02rh87i359em7h3sggd79356he.apps.googleusercontent.com">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' }}>
        <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', width: '300px' }}>
          {!isLogin && (
            <>
              <input
                type="text"
                name="firstname"
                placeholder="First Name"
                value={formData.firstname}
                onChange={handleInputChange}
                style={{ marginBottom: '10px', padding: '8px' }}
                required
              />
              <input
                type="text"
                name="lastname"
                placeholder="Last Name"
                value={formData.lastname}
                onChange={handleInputChange}
                style={{ marginBottom: '10px', padding: '8px' }}
                required
              />
              <input
                type="text"
                name="phoneno"
                placeholder="Phone Number"
                value={formData.phoneno}
                onChange={handleInputChange}
                style={{ marginBottom: '10px', padding: '8px' }}
                required
              />
            </>
          )}
          <input
            type="email"
            name="emailid"
            placeholder="Email"
            value={formData.emailid}
            onChange={handleInputChange}
            style={{ marginBottom: '10px', padding: '8px' }}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleInputChange}
            style={{ marginBottom: '10px', padding: '8px' }}
            required
          />
          <button type="submit" style={{ padding: '10px', marginTop: '10px' }}>
            {isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>

        <p style={{ marginTop: '20px' }}>
          {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
          <span style={{ color: 'blue', cursor: 'pointer' }} onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Sign Up' : 'Login'}
          </span>
        </p>

        {/* Google Sign-In Button */}
        <GoogleLogin
          onSuccess={googleLogin}
          onError={() => {
            Swal.fire({
              icon: 'error',
              title: 'Error!',
              text: 'Google login error. Please try again.',
              confirmButtonText: 'OK',
            });
          }}
        />
      </div>
    </GoogleOAuthProvider>
  );
}

export default LoginSignup;
