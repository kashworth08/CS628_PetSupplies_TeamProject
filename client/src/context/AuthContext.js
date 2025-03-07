import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);

  console.log('AuthProvider initial state:', { isLoading, isAuthenticated, token: !!token });

  // Force isLoading to false after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        console.log('Forcing isLoading to false after timeout');
        setIsLoading(false);
      }
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [isLoading]);

  // Check if user is already logged in (on app load)
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        console.log('Checking if user is logged in, token exists:', !!token);
        if (!token) {
          console.log('No token found, setting isLoading to false');
          setIsLoading(false);
          return;
        }
        
        console.log('Token found, verifying with backend');
        // Verify token and get user data
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        console.log('User data received:', response.data);
        setUser(response.data);
        setIsAuthenticated(true);
        setIsLoading(false);
        console.log('Authentication successful, isLoading set to false');
      } catch (err) {
        console.error('Authentication error:', err);
        localStorage.removeItem('token');
        setToken(null);
        setIsAuthenticated(false);
        setUser(null);
        setError(err.response?.data?.msg || 'Authentication failed');
        setIsLoading(false);
        console.log('Authentication failed, isLoading set to false');
      }
    };
    
    checkLoggedIn();
  }, [token]);

  // Login function
  const login = async (email, password) => {
    try {
      console.log('AuthContext: login attempt with email:', email);
      setError(null);
      
      console.log('AuthContext: making API call to login endpoint');
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/users/login`, {
        email,
        password
      });
      
      console.log('AuthContext: login API response received:', response.status);
      const { token: newToken, user } = response.data;
      
      console.log('AuthContext: user data received:', user);
      
      // Save token to localStorage
      localStorage.setItem('token', newToken);
      setToken(newToken);
      
      // Set user in state
      setUser(user);
      setIsAuthenticated(true);
      
      // Merge carts after login
      try {
        const sessionId = localStorage.getItem('sessionId');
        if (sessionId) {
          await axios.post(`${process.env.REACT_APP_API_URL}/api/cart/merge`, {}, {
            headers: {
              'Authorization': `Bearer ${newToken}`,
              'X-Session-Id': sessionId
            }
          });
          console.log('AuthContext: carts merged successfully');
        }
      } catch (mergeError) {
        console.error('AuthContext: Error merging carts:', mergeError);
        // Continue with login even if cart merge fails
      }
      
      console.log('AuthContext: login successful, user authenticated');
      return true;
    } catch (err) {
      console.error('AuthContext: Login error details:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        stack: err.stack
      });
      
      // Handle specific error types
      const errorData = err.response?.data;
      
      if (errorData?.errorType === 'user_not_found') {
        setError('User not found. Please check your email or register a new account.');
      } else if (errorData?.errorType === 'invalid_password') {
        setError('Invalid password. Please try again.');
      } else if (errorData?.field) {
        // Handle field-specific errors
        setError(errorData.msg || 'Login failed');
      } else {
        // Generic error
        setError(errorData?.msg || 'Login failed. Please try again later.');
      }
      
      console.log('AuthContext: login failed, error set:', error);
      return false;
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setError(null);
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/users/register`, userData);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.msg || 'Registration failed');
      throw err;
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  // Check if user is admin
  const isAdmin = () => {
    if (!user) return false;
    return user.role === 'admin';
  };

  console.log('AuthProvider current state:', { isLoading, isAuthenticated, user: !!user });

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        error,
        token,
        login,
        register,
        logout,
        isAdmin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 