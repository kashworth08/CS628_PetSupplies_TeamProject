import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Cart.css';

// Helper function to generate a session ID
const generateSessionId = () => {
  return 'sess_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Helper function to get or create a session ID
const getSessionId = () => {
  let sessionId = localStorage.getItem('sessionId');
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem('sessionId', sessionId);
  }
  return sessionId;
};

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated, token } = useAuth();
  const sessionId = getSessionId();
  const location = useLocation();

  // Force a refresh when component mounts
  useEffect(() => {
    console.log('Cart component mounted or location changed');
    // Force a refresh by setting loading to true
    setLoading(true);
  }, [location.key]);

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Fetching cart with session ID:', sessionId);
      console.log('User authenticated:', isAuthenticated);
      
      const headers = {
        'X-Session-Id': sessionId
      };
      
      if (isAuthenticated && token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('Adding Authorization header');
      }
      
      console.log('Fetch headers:', headers);
      console.log('API URL:', `${process.env.REACT_APP_API_URL}/api/cart`);
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/cart`, {
        headers,
        // Add cache busting parameter to prevent caching
        cache: 'no-store'
      });
      
      console.log('Cart response status:', response.status);
      
      if (!response.ok) {
        throw new Error('Failed to fetch cart');
      }
      
      const data = await response.json();
      console.log('Cart data received:', data);
      
      // Clean up any cart items with null products
      if (data && data.items && data.items.length > 0) {
        const validItems = data.items.filter(item => item.product !== null);
        
        // If we found invalid items, clean up the cart
        if (validItems.length < data.items.length) {
          console.log('Found invalid cart items, using filtered data');
          
          // Just use the filtered data for now
          data.items = validItems;
          
          // Optionally, we could update the server with a clean cart, but we'll
          // let the server handle this on its own to avoid complexity here
        }
      }
      
      setCart(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching cart:', error);
      setError('Failed to load your cart. Please try again later.');
      setLoading(false);
    }
  }, [token, isAuthenticated, sessionId]);

  // Fetch cart data whenever loading is set to true
  useEffect(() => {
    if (loading) {
      fetchCart();
    }
  }, [loading, fetchCart]);

  // Merge guest cart with user cart when user logs in
  useEffect(() => {
    const mergeCartsAfterLogin = async () => {
      if (isAuthenticated && token && sessionId) {
        try {
          const response = await fetch(`${process.env.REACT_APP_API_URL}/api/cart/merge`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'X-Session-Id': sessionId,
              'Content-Type': 'application/json'
            }
          });
          
          if (!response.ok) {
            throw new Error('Failed to merge carts');
          }
          
          const data = await response.json();
          setCart(data);
        } catch (error) {
          console.error('Error merging carts:', error);
          // Still fetch the cart even if merge fails
          fetchCart();
        }
      }
    };
    
    if (isAuthenticated) {
      mergeCartsAfterLogin();
    } else {
      fetchCart();
    }
  }, [isAuthenticated, token, sessionId, fetchCart]);

  const updateQuantity = async (productId, quantity) => {
    try {
      console.log('Updating quantity for product:', productId, 'to', quantity);
      
      const headers = {
        'Content-Type': 'application/json',
        'X-Session-Id': sessionId
      };
      
      if (isAuthenticated && token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      console.log('Update headers:', headers);
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/cart/${productId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ quantity })
      });
      
      console.log('Update response status:', response.status);
      
      if (response.status === 404) {
        // Item not found in cart - refresh the cart to get the latest state
        console.log('Item not found in cart, refreshing cart data');
        setLoading(true);
        return;
      }
      
      if (!response.ok) {
        // Instead of throwing an error, just refresh the cart
        console.log('Failed to update cart, refreshing cart data');
        setLoading(true);
        return;
      }
      
      const data = await response.json();
      console.log('Cart data after update:', data);
      
      // Update the local cart state
      setCart(data);
    } catch (error) {
      console.error('Error updating cart:', error);
      // Instead of showing an error, just refresh the cart
      console.log('Error occurred, refreshing cart data');
      setLoading(true);
    }
  };

  const removeItem = async (productId) => {
    try {
      console.log('Removing item from cart:', productId);
      
      const headers = {
        'X-Session-Id': sessionId
      };
      
      if (isAuthenticated && token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      console.log('Remove headers:', headers);
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/cart/${productId}`, {
        method: 'DELETE',
        headers
      });
      
      console.log('Remove response status:', response.status);
      
      if (response.status === 404) {
        // Item not found in cart - refresh the cart to get the latest state
        console.log('Item not found in cart, refreshing cart data');
        setLoading(true);
        return;
      }
      
      if (!response.ok) {
        throw new Error('Failed to remove item from cart');
      }
      
      const data = await response.json();
      console.log('Cart data after removal:', data);
      
      // Update the local cart state
      setCart(data);
      
      // If the cart is now empty, force a refresh
      if (!data.items || data.items.length === 0) {
        setLoading(true);
      }
    } catch (error) {
      console.error('Error removing item from cart:', error);
      // Instead of showing an error, just refresh the cart
      console.log('Error occurred, refreshing cart data');
      setLoading(true);
    }
  };

  const clearCart = async () => {
    try {
      console.log('Clearing cart');
      
      const headers = {
        'X-Session-Id': sessionId
      };
      
      if (isAuthenticated && token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      console.log('Clear cart headers:', headers);
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/cart`, {
        method: 'DELETE',
        headers
      });
      
      console.log('Clear cart response status:', response.status);
      
      if (!response.ok) {
        // Instead of throwing an error, just refresh the cart
        console.log('Failed to clear cart, refreshing cart data');
        setLoading(true);
        return;
      }
      
      const data = await response.json();
      console.log('Cart data after clearing:', data);
      
      // Update the local cart state
      setCart(data);
      
      // Force a refresh to show the empty cart
      setLoading(true);
    } catch (error) {
      console.error('Error clearing cart:', error);
      // Instead of showing an error, just refresh the cart
      console.log('Error occurred, refreshing cart data');
      setLoading(true);
    }
  };

  const calculateTotal = () => {
    if (!cart || !cart.items || cart.items.length === 0) {
      return 0;
    }
    
    return cart.items.reduce((total, item) => {
      if (!item.product) return total;
      return total + (item.product.Price * item.quantity);
    }, 0).toFixed(2);
  };

  if (loading) {
    return <div className="loading">Loading cart...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="cart-container">
        <h1>Your Cart</h1>
        <div className="empty-cart">
          <p>Your cart is empty</p>
          <Link to="/products" className="continue-shopping">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <h1>Your Cart</h1>
      
      <div className="cart-items">
        {cart.items.map((item) => {
          if (!item.product) return null;
          
          return (
            <div key={item.product._id} className="cart-item">
              <div className="item-details">
                <h3>{item.product.Name}</h3>
                <p className="item-description">{item.product.Description}</p>
                <p className="item-price">${item.product.Price.toFixed(2)}</p>
              </div>
              
              <div className="item-actions">
                <div className="quantity-controls">
                  <button 
                    onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
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
                
                <div className="item-subtotal">
                  ${(item.product.Price * item.quantity).toFixed(2)}
                </div>
                
                <button 
                  className="remove-item"
                  onClick={() => removeItem(item.product._id)}
                >
                  Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="cart-summary">
        <div className="cart-total">
          <h3>Total: ${calculateTotal()}</h3>
        </div>
        
        <div className="cart-actions">
          <button className="clear-cart" onClick={clearCart}>
            Clear Cart
          </button>
          
          <Link 
            to={isAuthenticated ? "/checkout" : "/login?redirect=checkout"} 
            className="checkout-button"
          >
            Proceed to Checkout
          </Link>
          
          <Link to="/products" className="continue-shopping">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Cart; 