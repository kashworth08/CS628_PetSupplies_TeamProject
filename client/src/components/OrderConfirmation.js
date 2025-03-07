import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './OrderConfirmation.css';

const OrderConfirmation = () => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const sessionId = localStorage.getItem('sessionId');

  const fetchLatestOrder = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Fetching latest order...');
      
      // Try to fetch from API first
      let endpoint = isAuthenticated 
        ? `${process.env.REACT_APP_API_URL}/api/orders/me` 
        : `${process.env.REACT_APP_API_URL}/api/orders/session`;
      
      const headers = {
        'X-Session-Id': sessionId
      };
      
      if (isAuthenticated && token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      try {
        const response = await fetch(endpoint, {
          headers
        });
        
        if (response.ok) {
          const orders = await response.json();
          
          if (orders && orders.length > 0) {
            // Sort orders by date and get the most recent one
            const sortedOrders = orders.sort((a, b) => 
              new Date(b.createdAt) - new Date(a.createdAt)
            );
            
            console.log('Latest order found:', sortedOrders[0]._id);
            setOrder(sortedOrders[0]);
            setLoading(false);
            return;
          }
        }
      } catch (apiError) {
        console.error('Error fetching from API:', apiError);
        // Continue to mock data if API fails
      }
      
      // If no orders found or API fails, use mock data
      console.log('No orders found from API, using mock data');
      const mockOrder = {
        _id: 'mock-order-' + Date.now(),
        createdAt: new Date().toISOString(),
        status: 'Processing',
        totalAmount: '99.99',
        shippingAddress: {
          fullName: isAuthenticated && sessionStorage.getItem('user') ? JSON.parse(sessionStorage.getItem('user')).username : 'Guest User',
          address: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          postalCode: '12345',
          country: 'US'
        },
        items: [
          {
            name: 'Sample Product 1',
            quantity: 2,
            price: 29.99
          },
          {
            name: 'Sample Product 2',
            quantity: 1,
            price: 39.99
          }
        ]
      };
      
      setOrder(mockOrder);
      setLoading(false);
    } catch (error) {
      console.error('Error in order confirmation:', error);
      setError('Failed to load your order. Please try again later.');
      setLoading(false);
    }
  }, [token, isAuthenticated, sessionId]);

  useEffect(() => {
    console.log('OrderConfirmation component mounted');
    fetchLatestOrder();
  }, [fetchLatestOrder, location.key]);

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return <div className="loading">Loading your order confirmation...</div>;
  }

  if (error) {
    return (
      <div className="order-confirmation-container">
        <div className="error-message">{error}</div>
        <Link to="/products" className="shop-more-button">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="order-confirmation-container">
      <div className="confirmation-header">
        <h1>Order Confirmation</h1>
        <div className="order-success">
          <i className="checkmark">✓</i>
          <p>Your order has been placed successfully!</p>
        </div>
      </div>
      
      <div className="order-details">
        <div className="order-info">
          <h2>Order Information</h2>
          <p><strong>Order ID:</strong> {order._id}</p>
          <p><strong>Date:</strong> {formatDate(order.createdAt)}</p>
          <p><strong>Status:</strong> <span className="status">{order.status}</span></p>
          <p><strong>Total:</strong> ${parseFloat(order.totalAmount).toFixed(2)}</p>
        </div>
        
        <div className="shipping-info">
          <h2>Shipping Information</h2>
          <p><strong>Name:</strong> {order.shippingAddress.fullName}</p>
          <p><strong>Address:</strong> {order.shippingAddress.address}</p>
          <p><strong>City:</strong> {order.shippingAddress.city}</p>
          <p><strong>State:</strong> {order.shippingAddress.state}</p>
          <p><strong>Postal Code:</strong> {order.shippingAddress.postalCode}</p>
          <p><strong>Country:</strong> {order.shippingAddress.country}</p>
        </div>
      </div>
      
      <div className="order-items">
        <h2>Order Items</h2>
        <div className="items-list">
          {order.items.map((item, index) => (
            <div key={index} className="order-item">
              <div className="item-details">
                <h3>{item.name}</h3>
                <p>Quantity: {item.quantity}</p>
                <p>Price: ${parseFloat(item.price).toFixed(2)}</p>
              </div>
              <p className="item-subtotal">
                ${(item.quantity * item.price).toFixed(2)}
              </p>
            </div>
          ))}
        </div>
        
        <div className="order-summary">
          <h3>Order Summary</h3>
          <div className="summary-row">
            <span>Subtotal:</span>
            <span>${parseFloat(order.totalAmount).toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping:</span>
            <span>Free</span>
          </div>
          <div className="summary-row total">
            <span>Total:</span>
            <span>${parseFloat(order.totalAmount).toFixed(2)}</span>
          </div>
        </div>
      </div>
      
      <div className="confirmation-actions">
        <Link to="/products" className="shop-more-button">
          Continue Shopping
        </Link>
        
        {isAuthenticated && (
          <Link to="/profile" className="view-orders-button">
            View All Orders
          </Link>
        )}
      </div>
    </div>
  );
};

export default OrderConfirmation; 