import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Checkout from './Checkout';

const SimpleCheckout = () => {
  const navigate = useNavigate();
  const [showFullCheckout, setShowFullCheckout] = useState(false);
  
  if (showFullCheckout) {
    try {
      return <Checkout />;
    } catch (error) {
      console.error("Error rendering full checkout:", error);
      // If there's an error with the full checkout, fall back to the simple version
    }
  }
  
  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '20px',
      backgroundColor: '#fff',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
    }}>
      <h1 style={{ color: '#333', marginBottom: '20px' }}>Checkout</h1>
      <p>Welcome to the checkout page. You can proceed with your order here.</p>
      
      <div style={{ 
        marginTop: '20px',
        padding: '15px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #ddd'
      }}>
        <h2 style={{ fontSize: '18px', marginBottom: '10px' }}>Order Summary</h2>
        <p>Your cart items will be displayed here.</p>
        <p style={{ fontWeight: 'bold', marginTop: '10px' }}>Total: $0.00</p>
      </div>
      
      <div style={{ 
        marginTop: '20px',
        padding: '15px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #ddd'
      }}>
        <h2 style={{ fontSize: '18px', marginBottom: '10px' }}>Shipping Information</h2>
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Full Name:</label>
          <input 
            type="text" 
            style={{ 
              width: '100%', 
              padding: '8px', 
              border: '1px solid #ddd', 
              borderRadius: '4px' 
            }} 
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Address:</label>
          <input 
            type="text" 
            style={{ 
              width: '100%', 
              padding: '8px', 
              border: '1px solid #ddd', 
              borderRadius: '4px' 
            }} 
          />
        </div>
      </div>
      
      <div style={{ 
        marginTop: '20px',
        padding: '15px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #ddd'
      }}>
        <h2 style={{ fontSize: '18px', marginBottom: '10px' }}>Payment Information</h2>
        <p>Payment processing is currently in development.</p>
      </div>
      
      <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'space-between' }}>
        <button 
          onClick={() => navigate('/cart')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#f8f9fa',
            border: '1px solid #ddd',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Back to Cart
        </button>
        
        <button 
          onClick={() => setShowFullCheckout(true)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Try Full Checkout
        </button>
        
        <button 
          onClick={() => navigate('/order-confirmation')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#4a90e2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Place Order
        </button>
      </div>
    </div>
  );
};

export default SimpleCheckout; 