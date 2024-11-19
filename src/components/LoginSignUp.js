import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import {jwtDecode} from 'jwt-decode'; // Correct import
import Swal from 'sweetalert2';
import './LoginSignup.css'; // External CSS file for styling

function LoginSignup() {
  const [isLogin, setIsLogin] = useState(true);
  const [udata, setUdata] = useState();
  const [formData, setFormData] = useState({
    emailid: '',
    password: '',
    firstname: '',
    lastname: '',
    phoneno: '',
  });

  const navigate = useNavigate();

  const profile = async () => {
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
        setUdata(data.profile);
        if (data.profile) {
          navigate('/home');
        }
      } else {
        console.error('Failed to fetch profile data');
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
    }
  };

  useEffect(() => {
    profile();
  }, [udata]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    if (!formData.emailid || !formData.password) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Input',
        text: 'Email and Password are required.',
        confirmButtonText: 'OK',
      });
      return false;
    }
    if (!isLogin && (!formData.firstname || !formData.lastname || !formData.phoneno)) {
      Swal.fire({
        icon: 'error',
        title: 'Incomplete Form',
        text: 'All fields are required for signup.',
        confirmButtonText: 'OK',
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

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
        Swal.fire({
          icon: 'success',
          title: isLogin ? 'Welcome Back!' : 'Account Created',
          text: isLogin ? `Good to see you again!` : 'You can now log in with your new account.',
          confirmButtonText: 'Continue',
        }).then(() => navigate('/home'));
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Authentication Failed',
          text: data.error || 'Something went wrong. Please try again.',
          confirmButtonText: 'OK',
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Network Error',
        text: error.message || 'Please check your connection and try again.',
        confirmButtonText: 'OK',
      });
    }
  };

  const googleLogin = async (credentialResponse) => {
    try {
      const { credential } = credentialResponse;
      const decoded = jwtDecode(credential);

      const firstname = decoded.given_name;
      const lastname = decoded.family_name;
      const emailid = decoded.email;

      const endpoint = isLogin
        ? 'http://localhost:2000/auth/google-login'
        : 'http://localhost:2000/auth/google-signup';

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
        Swal.fire({
          icon: 'success',
          title: 'Google Sign-In Successful',
          text: `Welcome ${firstname}!`,
          confirmButtonText: 'Continue',
        }).then(() => navigate('/home'));
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Google Authentication Failed',
          text: data.error || 'Please try again.',
          confirmButtonText: 'OK',
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to decode Google credentials or network issue occurred.',
        confirmButtonText: 'OK',
      });
    }
  };

  return (
    <GoogleOAuthProvider clientId="1075893040673-0ikvhs02rh87i359em7h3sggd79356he.apps.googleusercontent.com">
      <div className="container">
        <h1 className="title">InterviewPrep</h1>
        <div className="auth-container">
          <h2 className="auth-header">{isLogin ? 'Welcome Back!' : 'Create Your Account'}</h2>
          <form onSubmit={handleSubmit} className="auth-form">
            {!isLogin && (
              <>
                <input
                  type="text"
                  name="firstname"
                  placeholder="First Name"
                  value={formData.firstname}
                  onChange={handleInputChange}
                  className="auth-input"
                  required
                />
                <input
                  type="text"
                  name="lastname"
                  placeholder="Last Name"
                  value={formData.lastname}
                  onChange={handleInputChange}
                  className="auth-input"
                  required
                />
                <input
                  type="text"
                  name="phoneno"
                  placeholder="Phone Number"
                  value={formData.phoneno}
                  onChange={handleInputChange}
                  className="auth-input"
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
              className="auth-input"
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              className="auth-input"
              required
            />
            <button type="submit" className="auth-button">
              {isLogin ? 'Login' : 'Sign Up'}
            </button>
          </form>
          <p className="toggle-text">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
            <span className="toggle-link" onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? 'Sign Up' : 'Login'}
            </span>
          </p>
          <GoogleLogin
            onSuccess={googleLogin}
            onError={() =>
              Swal.fire({
                icon: 'error',
                title: 'Google Sign-In Failed',
                text: 'Please try again.',
                confirmButtonText: 'OK',
              })
            }
          />
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}

export default LoginSignup;
