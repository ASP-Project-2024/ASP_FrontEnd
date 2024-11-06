import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
    
    // Log formData to check if data is correctly stored
    console.log('Form Data:', formData);

    // Select endpoint based on login or signup action
    const endpoint = isLogin ? 'http://localhost:2000/auth/login' : 'http://localhost:2000/auth/signup';
    
    // If it's signup, ensure the form data includes all required fields for signup
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
        body: JSON.stringify(bodyData), // Send the appropriate data based on login/signup
      });

      if (!response.ok) {
        // If response isn't okay, log an error message
        const errorData = await response.json();
        console.error('Error:', errorData.message || 'Failed to submit');
      } else {
        // Navigate to home page if login or signup is successful
        navigate('/home');
      }
    } catch (error) {
      console.error('Network error:', error.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' }}>
      <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', width: '300px' }}>
        {/* Show additional input fields for signup */}
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
        <span
          style={{ color: 'blue', cursor: 'pointer' }}
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin ? 'Sign Up' : 'Login'}
        </span>
      </p>
    </div>
  );
}

export default LoginSignup;
