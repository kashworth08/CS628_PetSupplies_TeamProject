import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './OrderConfirmation.css';

const OrderConfirmation = () => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated, token } = useAuth();
  const navigate = useNavigate();

  const fetchLatestOrder = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/orders/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      
      const orders = await response.json();
      
      if (!orders || orders.length === 0) {
        setError('No orders found');
        setLoading(false);
        return;
      }
      
      // Sort orders by date and get the most recent one
      const sortedOrders = orders.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      
      setOrder(sortedOrders[0]);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching order:', error);
      setError('Failed to load your order. Please try again later.');
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    fetchLatestOrder();
  }, [isAuthenticated, navigate, fetchLatestOrder]);

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
      </div>
    </div>
  );
};

export default OrderConfirmation; 