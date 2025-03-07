const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { auth } = require('../middleware/auth');

// @route   POST /api/payments/create-payment-intent
// @desc    Create a payment intent
// @access  Private
router.post('/create-payment-intent', auth, async (req, res) => {
  try {
    const { amount, items, shipping } = req.body;
    
    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // amount in cents, rounded to ensure it's an integer
      currency: 'usd',
      metadata: {
        userId: req.user._id.toString(),
        shipping: JSON.stringify(shipping)
      }
    });
    
    res.json({
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    console.error('Payment intent error:', error);
    res.status(500).json({ msg: 'Server error' });
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