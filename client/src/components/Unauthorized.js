import React from 'react';
import { Link } from 'react-router-dom';
import './Unauthorized.css';

const Unauthorized = () => {
  return (
    <div className="unauthorized-container">
      <div className="unauthorized-content">
        <h1>Access Denied</h1>
        <div className="icon">
          <i className="lock-icon">🔒</i>
        </div>
        <p>You don't have permission to access this page.</p>
        <p>This area is restricted to administrators only.</p>
        <div className="actions">
          <Link to="/" className="home-button">Return to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized; 