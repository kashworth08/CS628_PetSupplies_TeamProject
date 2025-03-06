import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import './Checkout.css';

// Initialize Stripe with your publishable key from environment variables
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const CheckoutForm = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [succeeded, setSucceeded] = useState(false);
  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US'
  });
  const { isAuthenticated, token, user } = useAuth();
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/cart', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch cart');
      }
      
      const data = await response.json();
      
      if (!data.items || data.items.length === 0) {
        navigate('/cart');
        return;
      }
      
      setCart(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching cart:', error);
      setError('Failed to load your cart. Please try again later.');
      setLoading(false);
    }
  }, [token, navigate]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    // Pre-fill name if available
    if (user && user.name) {
      setShippingInfo(prev => ({ ...prev, fullName: user.name }));
    }
    
    fetchCart();
  }, [isAuthenticated, navigate, user, fetchCart]);

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateTotal = () => {
    if (!cart || !cart.items || cart.items.length === 0) return 0;
    
    return cart.items.reduce((total, item) => {
      return total + (item.product.Price * item.quantity);
    }, 0).toFixed(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      // Stripe.js has not loaded yet
      return;
    }
    
    // Validate shipping info
    for (const [key, value] of Object.entries(shippingInfo)) {
      if (!value.trim()) {
        setError(`Please enter your ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return;
      }
    }
    
    setProcessing(true);
    setError(null);
    
    try {
      // Create payment intent on the server
      const response = await fetch('http://localhost:5000/api/payments/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: Math.round(parseFloat(calculateTotal()) * 100), // Convert to cents for Stripe
          items: cart.items,
          shipping: shippingInfo
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }
      
      const data = await response.json();
      
      // Confirm card payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: shippingInfo.fullName
          }
        }
      });
      
      if (error) {
        setError(`Payment failed: ${error.message}`);
        setProcessing(false);
        return;
      }
      
      if (paymentIntent.status === 'succeeded') {
        // Create order
        const orderResponse = await fetch('http://localhost:5000/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            items: cart.items.map(item => ({
              product: item.product._id,
              name: item.product.Name,
              quantity: item.quantity,
              price: item.product.Price
            })),
            shippingAddress: shippingInfo,
            paymentInfo: {
              paymentId: paymentIntent.id,
              status: paymentIntent.status
            },
            totalAmount: calculateTotal()
          })
        });
        
        if (!orderResponse.ok) {
          throw new Error('Failed to create order');
        }
        
        // Clear cart
        await fetch('http://localhost:5000/api/cart', {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        setSucceeded(true);
        setProcessing(false);
        
        // Redirect to order confirmation page after a delay
        setTimeout(() => {
          navigate('/order-confirmation');
        }, 2000);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      setError('An error occurred during checkout. Please try again.');
      setProcessing(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading checkout information...</div>;
  }

  if (error && !processing) {
    return (
      <div className="checkout-container">
        <div className="error-message">{error}</div>
        <button className="back-button" onClick={() => navigate('/cart')}>
          Back to Cart
        </button>
      </div>
    );
  }

  if (succeeded) {
    return (
      <div className="checkout-container success">
        <h2>Payment Successful!</h2>
        <p>Thank you for your order. You will be redirected to the order confirmation page.</p>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <h1>Checkout</h1>
      
      <div className="checkout-content">
        <div className="order-summary">
          <h2>Order Summary</h2>
          {cart && cart.items && cart.items.map((item) => (
            <div key={item.product._id} className="summary-item">
              <div className="item-info">
                <h3>{item.product.Name}</h3>
                <p>Quantity: {item.quantity}</p>
              </div>
              <p className="item-price">${(item.product.Price * item.quantity).toFixed(2)}</p>
            </div>
          ))}
          
          <div className="order-total">
            <h3>Total</h3>
            <p>${calculateTotal()}</p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="checkout-form">
          <div className="form-section">
            <h2>Shipping Information</h2>
            
            <div className="form-group">
              <label htmlFor="fullName">Full Name</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={shippingInfo.fullName}
                onChange={handleShippingChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="address">Address</label>
              <input
                type="text"
                id="address"
                name="address"
                value={shippingInfo.address}
                onChange={handleShippingChange}
                required
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">City</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={shippingInfo.city}
                  onChange={handleShippingChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="state">State</label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={shippingInfo.state}
                  onChange={handleShippingChange}
                  required
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="postalCode">Postal Code</label>
                <input
                  type="text"
                  id="postalCode"
                  name="postalCode"
                  value={shippingInfo.postalCode}
                  onChange={handleShippingChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="country">Country</label>
                <select
                  id="country"
                  name="country"
                  value={shippingInfo.country}
                  onChange={handleShippingChange}
                  required
                >
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="UK">United Kingdom</option>
                  <option value="AU">Australia</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="form-section">
            <h2>Payment Information</h2>
            <div className="card-element-container">
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: '#424770',
                      '::placeholder': {
                        color: '#aab7c4',
                      },
                    },
                    invalid: {
                      color: '#9e2146',
                    },
                  },
                }}
              />
            </div>
          </div>
          
          <div className="checkout-actions">
            <button 
              type="button" 
              className="back-button"
              onClick={() => navigate('/cart')}
              disabled={processing}
            >
              Back to Cart
            </button>
            
            <button 
              type="submit" 
              className="pay-button"
              disabled={processing || !stripe}
            >
              {processing ? 'Processing...' : `Pay $${calculateTotal()}`}
            </button>
          </div>
          
          {error && <div className="error-message">{error}</div>}
        </form>
      </div>
    </div>
  );
};

const Checkout = () => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
};

export default Checkout; 