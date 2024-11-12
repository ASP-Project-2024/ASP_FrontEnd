import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

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
      });

      if (response.ok) {
        navigate('/home');
      } else {
        const errorData = await response.json();
        console.error('Error:', errorData.message || 'Failed to submit');
      }
    } catch (error) {
      console.error('Network error:', error.message);
    }
  };

  // Google Login function
  const googleLogin = async (tokenResponse) => {
    try {
      const userInfo = await fetch(
        'https://people.googleapis.com/v1/people/me?personFields=names,emailAddresses,phoneNumbers',
        {
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`,
          },
        }
      );
      const data = await userInfo.json();

      console.log('User Info from Google:', data);

      // You can extract the required information from the data
      const { givenName, familyName, phoneNumbers, emailAddresses } = data;
      const phoneNumber = phoneNumbers && phoneNumbers[0]?.value; // Get phone number if available
      const email = emailAddresses && emailAddresses[0]?.value; // Get email address if available

      // Set data in the formData state
      setFormData({
        ...formData,
        firstname: givenName,
        lastname: familyName,
        phoneno: phoneNumber || '',
        emailid: email || '',
      });

      // Optionally, navigate to home or profile page
      navigate('/home');
    } catch (error) {
      console.error('Error fetching Google user data:', error.message);
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
          onError={(error) => console.error("Google login error", error)}
          useOneTap
        />
      </div>
    </GoogleOAuthProvider>
  );
}

export default LoginSignup;
