import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import './Checkout.css';

// Initialize Stripe with your publishable key from environment variables
const stripeKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;
console.log("Stripe key available:", !!stripeKey, "Key value:", stripeKey);
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

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
  const [cardError, setCardError] = useState('');
  const { isAuthenticated, token, user } = useAuth();
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();
  const sessionId = localStorage.getItem('sessionId');

  // Function to fetch the user's cart
  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Fetching cart for checkout...');
      
      const headers = {
        'X-Session-Id': sessionId
      };
      
      if (isAuthenticated && token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/cart`, {
        headers,
        cache: 'no-store'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch cart');
      }
      
      const data = await response.json();
      console.log('Cart data received:', data);
      
      if (!data.items || data.items.length === 0) {
        console.log('Cart is empty, redirecting to cart page');
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
  }, [token, navigate, isAuthenticated, sessionId]);

  // Initialize checkout when component mounts
  useEffect(() => {
    console.log('Checkout component mounted');
    
    // Pre-fill shipping info if user is authenticated
    if (isAuthenticated && user) {
      console.log('Pre-filling shipping info with user data');
      setShippingInfo(prev => ({ 
        ...prev, 
        fullName: user.username || '',
        address: user.address || ''
      }));
    }
    
    fetchCart();
  }, [isAuthenticated, user, fetchCart]);

  // Handle changes to shipping form fields
  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Calculate the total price of items in the cart
  const calculateTotal = () => {
    if (!cart || !cart.items || cart.items.length === 0) return 0;
    
    return cart.items.reduce((total, item) => {
      return total + (item.product.Price * item.quantity);
    }, 0).toFixed(2);
  };

  // Handle card element changes
  const handleCardChange = (event) => {
    setCardError(event.error ? event.error.message : '');
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      // Stripe.js has not loaded yet
      setError('Payment processing is not available. Please try again later.');
      return;
    }
    
    // Validate shipping info
    for (const [key, value] of Object.entries(shippingInfo)) {
      if (!value.trim()) {
        setError(`Please enter your ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return;
      }
    }
    
    // Validate card details
    if (cardError) {
      setError(cardError);
      return;
    }
    
    setProcessing(true);
    setError(null);
    
    try {
      console.log('Creating payment intent...');
      // Create payment intent on the server
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/payments/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': isAuthenticated && token ? `Bearer ${token}` : '',
          'X-Session-Id': sessionId
        },
        body: JSON.stringify({
          amount: Math.round(parseFloat(calculateTotal()) * 100), // Convert to cents for Stripe
          items: cart.items,
          shipping: shippingInfo
        })
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('Payment intent creation failed:', errorData);
        throw new Error('Failed to create payment intent');
      }
      
      const data = await response.json();
      console.log('Payment intent created successfully');
      
      // Confirm card payment
      console.log('Confirming card payment...');
      const { error, paymentIntent } = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: shippingInfo.fullName,
            address: {
              line1: shippingInfo.address,
              city: shippingInfo.city,
              state: shippingInfo.state,
              postal_code: shippingInfo.postalCode,
              country: shippingInfo.country
            }
          }
        }
      });
      
      if (error) {
        console.error('Payment confirmation failed:', error);
        setError(`Payment failed: ${error.message}`);
        setProcessing(false);
        return;
      }
      
      if (paymentIntent.status === 'succeeded') {
        console.log('Payment succeeded, creating order...');
        // Create order
        const orderResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': isAuthenticated && token ? `Bearer ${token}` : '',
            'X-Session-Id': sessionId
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
          const orderError = await orderResponse.text();
          console.error('Order creation failed:', orderError);
          throw new Error('Failed to create order');
        }
        
        console.log('Order created successfully, clearing cart...');
        // Clear cart
        await fetch(`${process.env.REACT_APP_API_URL}/api/cart`, {
          method: 'DELETE',
          headers: {
            'Authorization': isAuthenticated && token ? `Bearer ${token}` : '',
            'X-Session-Id': sessionId
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

  // Function to handle demo checkout (skip payment)
  const handleDemoCheckout = (e) => {
    e.preventDefault();
    console.log('Demo checkout - skipping payment processing');
    
    // Navigate directly to order confirmation
    navigate('/order-confirmation');
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
          {cart && cart.items && cart.items.map((item, index) => (
            <div key={index} className="summary-item">
              <div className="item-info">
                <h3>{item.product.Name}</h3>
                <p>Quantity: {item.quantity}</p>
              </div>
              <div className="item-price">
                ${(item.product.Price * item.quantity).toFixed(2)}
              </div>
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
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={shippingInfo.country}
                  onChange={handleShippingChange}
                  required
                />
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
                onChange={handleCardChange}
              />
            </div>
            {cardError && <div className="card-error">{cardError}</div>}
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
              type="button" 
              className="demo-button"
              onClick={handleDemoCheckout}
              disabled={processing}
            >
              Skip Payment (Demo)
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

// Main Checkout component
const Checkout = () => {
  console.log("Checkout component rendering, stripePromise:", !!stripePromise);
  const [stripeError, setStripeError] = useState(false);
  
  useEffect(() => {
    // Check if Stripe is available
    if (!stripePromise) {
      console.error("Stripe key is missing or invalid!");
      setStripeError(true);
    }
  }, []);
  
  // If Stripe key is missing, show error
  if (stripeError || !stripePromise) {
    console.error("Showing Stripe error UI");
    return (
      <div className="checkout-container">
        <div className="error-message">
          <h2>Payment Processing Unavailable</h2>
          <p>We're currently unable to process payments. This could be due to a configuration issue or a temporary outage.</p>
          <p>Please try again later or contact customer support for assistance.</p>
          <button 
            className="back-button" 
            onClick={() => window.history.back()}
            style={{ marginTop: '20px' }}
          >
            Back to Cart
          </button>
        </div>
      </div>
    );
  }

  try {
    return (
      <Elements stripe={stripePromise}>
        <CheckoutForm />
      </Elements>
    );
  } catch (error) {
    console.error("Error rendering Stripe Elements:", error);
    return (
      <div className="checkout-container">
        <div className="error-message">
          <h2>Payment Processing Error</h2>
          <p>An error occurred while setting up the payment form. Please try again later.</p>
          <button 
            className="back-button" 
            onClick={() => window.history.back()}
            style={{ marginTop: '20px' }}
          >
            Back to Cart
          </button>
        </div>
      </div>
    );
  }
};

export default Checkout; 