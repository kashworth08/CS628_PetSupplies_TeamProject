import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isAdminAttempt, setIsAdminAttempt] = useState(false);
  
  const { login, error, isAuthenticated, isAdmin } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  const { email, password } = formData;

  // Check if user is trying to access admin route
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('admin') === 'true') {
      setIsAdminAttempt(true);
    }
  }, [location]);
  
  // Redirect if already logged in
  useEffect(() => {
    console.log('Login: Redirect useEffect triggered with state:', { 
      isAuthenticated, 
      isAdminAttempt, 
      isAdmin: isAdmin?.(), 
      location 
    });
    
    if (isAuthenticated) {
      console.log('Login: User is authenticated, determining redirect path');
      if (isAdminAttempt && !isAdmin()) {
        console.log('Login: Admin attempt but user is not admin, redirecting to unauthorized');
        navigate('/unauthorized');
      } else {
        // Check for redirect parameter
        const params = new URLSearchParams(location.search);
        const redirectTo = params.get('redirect');
        
        // Determine where to redirect
        let redirectPath = location.state?.from?.pathname || '/';
        if (redirectTo === 'checkout') {
          redirectPath = '/checkout';
        }
        
        console.log(`Login: Redirecting to ${redirectPath}`);
        navigate(redirectPath);
      }
    } else {
      console.log('Login: User is not authenticated, no redirect needed');
    }
  }, [isAuthenticated, isAdmin, isAdminAttempt, navigate, location]);
  
  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    
    // Clear error for this field when user starts typing
    if (formErrors[e.target.name]) {
      setFormErrors({
        ...formErrors,
        [e.target.name]: ''
      });
    }
  };
  
  const validate = () => {
    const errors = {};
    
    if (!email) {
      errors.email = 'Email is required';
    } else {
      const emailRegex = /^\S+@\S+\.\S+$/;
      if (!emailRegex.test(email)) {
        errors.email = 'Please enter a valid email';
      }
    }
    
    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async e => {
    e.preventDefault();
    
    console.log('Login form submitted with:', { email, password, isAdminAttempt });
    
    if (!validate()) {
      console.log('Validation failed');
      return;
    }
    
    console.log('Attempting login...');
    const success = await login(email, password);
    
    console.log('Login result:', success);
    
    if (success) {
      console.log('Login successful, navigation should be handled by useEffect');
      // Login successful, navigation is handled in the useEffect
    } else {
      console.log('Login failed, error:', error);
    }
  };
  
  return (
    <div className="login-container">
      <h2>{isAdminAttempt ? 'Admin Login' : 'Login'}</h2>
      
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
            placeholder="Enter your email"
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
            placeholder="Enter your password"
          />
          {formErrors.password && <span className="error-text">{formErrors.password}</span>}
        </div>
        
        <button type="submit" className="login-button">
          {isAdminAttempt ? 'Admin Login' : 'Login'}
        </button>
      </form>
      
      {isAdminAttempt ? (
        <div className="admin-note">
          <p>This area is restricted to administrators only.</p>
          <Link to="/login" className="regular-login-link">Regular User Login</Link>
        </div>
      ) : (
        <div className="register-link">
          Don't have an account? <Link to="/register">Register</Link>
        </div>
      )}
    </div>
  );
};

export default Login; 