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
        const response = await axios.get('http://localhost:5000/api-test');
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
      const response = await axios.get('http://localhost:5000/api/users/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setAuthStatus(`Auth success: ${JSON.stringify(response.data)}`);
    } catch (error) {
      setAuthStatus(`Auth error: ${error.response?.data?.msg || error.message}`);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>API Test Component</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>API Status</h2>
        <p>{apiStatus}</p>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Auth Test</h2>
        <input 
          type="text" 
          value={token} 
          onChange={(e) => setToken(e.target.value)} 
          placeholder="Enter JWT token"
          style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
        />
        <button 
          onClick={testAuth}
          style={{ padding: '8px 16px', background: '#4CAF50', color: 'white', border: 'none', cursor: 'pointer' }}
        >
          Test Authentication
        </button>
        <p>{authStatus}</p>
      </div>
      
      <div>
        <h2>Debug Info</h2>
        <p>React Router DOM version: 6.22.0</p>
        <p>React version: 18.2.0</p>
      </div>
    </div>
  );
};

export default TestAuth; 