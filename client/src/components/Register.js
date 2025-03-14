import React, { useState } from 'react';
import axios from 'axios';
import './Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');

  const { username, email, password, confirmPassword, address } = formData;

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const newErrors = {};

    if (!username || username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!email || !emailRegex.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    // Password validation - at least 8 characters, one uppercase letter, and one special character
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,})/;
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (!passwordRegex.test(password)) {
      newErrors.password = 'Password must be at least 8 characters with one uppercase letter and one special character';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!address) {
      newErrors.address = 'Address is required';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...registrationData } = formData;
      await axios.post('http://localhost:5000/api/users/register', registrationData);
      setSuccess('Registration successful!');
      setFormData({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        address: '',
      });
      setErrors({});
    } catch (error) {
      if (error.response && error.response.data) {
        if (error.response.data.errors) {
          // Handle array of errors from server
          setErrors({ apiError: error.response.data.errors.join(', ') });
        } else {
          setErrors({ apiError: error.response.data.msg });
        }
      } else {
        setErrors({ apiError: 'Server error' });
      }
    }
  };

  return (
    <div className="register-container">
      <h2>Register</h2>
      {success && <p className="success-msg">{success}</p>}
      {errors.apiError && <p className="error-msg">{errors.apiError}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username:</label>
          <input 
            type="text" 
            name="username" 
            value={username} 
            onChange={handleChange} 
          />
          {errors.username && <span className="error-msg">{errors.username}</span>}
        </div>

        <div>
          <label>Email:</label>
          <input 
            type="email" 
            name="email" 
            value={email} 
            onChange={handleChange} 
          />
          {errors.email && <span className="error-msg">{errors.email}</span>}
        </div>

        <div>
          <label>Password:</label>
          <input 
            type="password" 
            name="password" 
            value={password} 
            onChange={handleChange} 
          />
          {errors.password && <span className="error-msg">{errors.password}</span>}
          <small className="password-hint">
            Password must be at least 8 characters with one uppercase letter (A-Z) and one special character (!@#$%^&*).
          </small>
        </div>

        <div>
          <label>Confirm Password:</label>
          <input 
            type="password" 
            name="confirmPassword" 
            value={confirmPassword} 
            onChange={handleChange} 
          />
          {errors.confirmPassword && <span className="error-msg">{errors.confirmPassword}</span>}
        </div>

        <div>
          <label>Address:</label>
          <input 
            type="text" 
            name="address" 
            value={address} 
            onChange={handleChange} 
          />
          {errors.address && <span className="error-msg">{errors.address}</span>}
        </div>

        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register; 