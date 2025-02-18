import React from 'react';
import './Guest.css';

const Guest = () => {
  return (
    <div className="guest-container">
      <h2>Welcome Guest!</h2>
      <div className="guest-content">
        <p>Browse our products without creating an account.</p>
        <p>Note: You'll need to register to make purchases.</p>
        
        {/* Add any guest-specific content or limited product views */}
        <div className="guest-features">
          <h3>As a Guest you can:</h3>
          <ul>
            <li>Browse Products</li>
            <li>View Product Details</li>
            <li>Compare Prices</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Guest; 