import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [formErrors, setFormErrors] = useState({});
  
  const { login, error } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const { email, password } = formData;
  
  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const validate = () => {
    const errors = {};
    
    if (!email) {
      errors.email = 'Email is required';
    }
    
    if (!password) {
      errors.password = 'Password is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async e => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    const success = await login(email, password);
    
    if (success) {
      navigate('/');
    }
  };
  
  return (
    <div className="login-container">
      <h2>Login</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={handleChange}
            className={formErrors.email ? 'error' : ''}
          />
          {formErrors.email && <span className="error-text">{formErrors.email}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={handleChange}
            className={formErrors.password ? 'error' : ''}
          />
          {formErrors.password && <span className="error-text">{formErrors.password}</span>}
        </div>
        
        <button type="submit" className="login-button">Login</button>
      </form>
      
      <div className="register-link">
        Don't have an account? <Link to="/register">Register</Link>
      </div>
    </div>
  );
};

export default Login; 