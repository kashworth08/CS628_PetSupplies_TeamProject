import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TestAuth = () => {
  const [apiStatus, setApiStatus] = useState('Checking...');
  const [authStatus, setAuthStatus] = useState('Not tested');
  const [token, setToken] = useState('');

  useEffect(() => {
    // Test basic API connectivity
    const testApi = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api-test`);
        setApiStatus(`API is working: ${response.data.message}`);
      } catch (error) {
        setApiStatus(`API error: ${error.message}`);
      }
    };

    testApi();
  }, []);

  const testAuth = async () => {
    try {
      setAuthStatus('Testing...');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setAuthStatus(`Auth successful! User: ${response.data.email} (${response.data.role})`);
    } catch (error) {
      setAuthStatus(`Auth failed: ${error.response?.data?.msg || error.message}`);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Authentication Test</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>API Status</h2>
        <p>{apiStatus}</p>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Auth Test</h2>
        <p>Enter a JWT token to test authentication:</p>
        <input 
          type="text" 
          value={token} 
          onChange={(e) => setToken(e.target.value)} 
          style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
          placeholder="JWT token"
        />
        <button 
          onClick={testAuth}
          style={{ padding: '8px 16px', backgroundColor: '#4CAF50', color: 'white', border: 'none', cursor: 'pointer' }}
        >
          Test Authentication
        </button>
        <p>{authStatus}</p>
      </div>
      
      <div>
        <h2>Environment</h2>
        <p>API URL: {process.env.REACT_APP_API_URL || 'Not set'}</p>
      </div>
    </div>
  );
};

export default TestAuth; 