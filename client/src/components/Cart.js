import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Cart.css';

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated, token } = useAuth();
  const navigate = useNavigate();

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/cart`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch cart');
      }
      
      const data = await response.json();
      setCart(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching cart:', error);
      setError('Failed to load your cart. Please try again later.');
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    fetchCart();
  }, [isAuthenticated, navigate, fetchCart]);

  const updateQuantity = async (productId, quantity) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/cart/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ quantity })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update cart');
      }
      
      fetchCart();
    } catch (error) {
      console.error('Error updating cart:', error);
      setError('Failed to update cart. Please try again later.');
    }
  };

  const removeItem = async (productId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/cart/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to remove item from cart');
      }
      
      fetchCart();
    } catch (error) {
      console.error('Error removing item from cart:', error);
      setError('Failed to remove item from cart. Please try again later.');
    }
  };

  const clearCart = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/cart/clear`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to clear cart');
      }
      
      fetchCart();
    } catch (error) {
      console.error('Error clearing cart:', error);
      setError('Failed to clear cart. Please try again later.');
    }
  };

  const calculateTotal = () => {
    if (!cart || !cart.items || cart.items.length === 0) return 0;
    
    return cart.items.reduce((total, item) => {
      return total + (item.product.Price * item.quantity);
    }, 0).toFixed(2);
  };

  if (loading) {
    return <div className="loading">Loading your cart...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="cart-container empty-cart">
        <h1>Your Cart</h1>
        <p>Your cart is empty.</p>
        <Link to="/products" className="continue-shopping">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <h1>Your Cart</h1>
      
      <div className="cart-items">
        {cart.items.map((item) => (
          <div key={item.product._id} className="cart-item">
            <div className="item-details">
              <h3>{item.product.Name}</h3>
              <p className="item-description">{item.product.Description}</p>
              <p className="item-price">${item.product.Price.toFixed(2)}</p>
            </div>
            
            <div className="item-actions">
              <div className="quantity-controls">
                <button 
                  onClick={() => updateQuantity(item.product._id, Math.max(1, item.quantity - 1))}
                  disabled={item.quantity <= 1}
                >
                  -
                </button>
                <span>{item.quantity}</span>
                <button 
                  onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                  disabled={item.quantity >= item.product.Stock}
                >
                  +
                </button>
              </div>
              
              <p className="item-subtotal">
                ${(item.product.Price * item.quantity).toFixed(2)}
              </p>
              
              <button 
                className="remove-item" 
                onClick={() => removeItem(item.product._id)}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="cart-summary">
        <div className="cart-total">
          <h3>Total: ${calculateTotal()}</h3>
        </div>
        
        <div className="cart-actions">
          <button className="clear-cart" onClick={clearCart}>
            Clear Cart
          </button>
          <Link to="/checkout" className="checkout-button">
            Proceed to Checkout
          </Link>
        </div>
      </div>
      
      <Link to="/products" className="continue-shopping">
        Continue Shopping
      </Link>
    </div>
  );
};

export default Cart; 