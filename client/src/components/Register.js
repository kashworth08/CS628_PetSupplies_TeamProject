import React, { useState } from 'react';
import axios from 'axios';
import './Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    address: '',
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');

  const { username, email, password, address } = formData;

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

    if (!password || password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
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
      const res = await axios.post('http://localhost:5000/api/users/register', formData);
      setSuccess('Registration successful!');
      setFormData({
        username: '',
        email: '',
        password: '',
        address: '',
      });
      setErrors({});
    } catch (error) {
      if (error.response && error.response.data) {
        setErrors({ apiError: error.response.data.msg });
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