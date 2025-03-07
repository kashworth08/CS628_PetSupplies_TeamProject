const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { auth } = require('../middleware/auth');
const Cart = require('../models/Cart');

// Middleware to handle both authenticated and guest users
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    // If there's an auth header, use the auth middleware
    return auth(req, res, next);
  } else {
    // Otherwise, just continue without authentication
    next();
  }
};

// @route   POST /api/payments/create-payment-intent
// @desc    Create a payment intent
// @access  Public (with session tracking)
router.post('/create-payment-intent', optionalAuth, async (req, res) => {
  try {
    const { amount, items, shipping } = req.body;
    const sessionId = req.headers['x-session-id'];
    
    if (!sessionId) {
      return res.status(400).json({ msg: 'Session ID is required' });
    }
    
    // Validate cart exists
    const userId = req.user ? req.user._id : null;
    const cart = await Cart.findOne({ 
      $or: [
        { user: userId },
        { sessionId: sessionId }
      ]
    });
    
    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({ msg: 'Cart is empty or not found' });
    }
    
    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // amount in cents, rounded to ensure it's an integer
      currency: 'usd',
      metadata: {
        userId: userId ? userId.toString() : 'guest',
        sessionId: sessionId,
        shipping: JSON.stringify(shipping)
      }
    });
    
    console.log(`Payment intent created: ${paymentIntent.id}`);
    
    res.json({
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    console.error('Payment intent error:', error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
});

// @route   POST /api/payments/webhook
// @desc    Handle Stripe webhook events
// @access  Public
router.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      // Handle successful payment
      console.log('PaymentIntent was successful!', paymentIntent.id);
      // Here you would typically:
      // 1. Create an order in your database
      // 2. Update inventory
      // 3. Send confirmation email
      break;
    case 'payment_intent.payment_failed':
      // Handle failed payment
      console.log('Payment failed!');
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.send();
});

module.exports = router; 