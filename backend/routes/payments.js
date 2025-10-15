const express = require('express');
const Payment = require('../models/Payment');
const Listing = require('../models/Listing');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Initiate M-Pesa payment
router.post('/mpesa/initiate', auth, async (req, res) => {
  try {
    const { amount, phoneNumber, paymentType, listingId, description } = req.body;

    // Create payment record
    const payment = new Payment({
      user: req.userId,
      listing: listingId,
      paymentType,
      amount,
      phoneNumber,
      mpesaTransactionId: `TXN${Date.now()}`, // This would be from M-Pesa API
      description,
      status: 'pending'
    });

    await payment.save();

    // Here you would integrate with M-Pesa API
    // For now, we'll simulate the process
    
    res.json({
      success: true,
      paymentId: payment._id,
      message: 'Payment initiated. Please complete on your phone.',
      transactionId: payment.mpesaTransactionId
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Confirm payment (webhook from M-Pesa)
router.post('/mpesa/callback', async (req, res) => {
  try {
    const { transactionId, receiptNumber, status } = req.body;

    const payment = await Payment.findOne({ mpesaTransactionId: transactionId });
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    payment.status = status;
    payment.mpesaReceiptNumber = receiptNumber;
    await payment.save();

    if (status === 'completed') {
      // Handle successful payment based on type
      if (payment.paymentType === 'listing_fee') {
        await Listing.findByIdAndUpdate(payment.listing, {
          isActive: true,
          paymentStatus: 'paid',
          paymentExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        });
      } else if (payment.paymentType === 'subscription') {
        await User.findByIdAndUpdate(payment.user, {
          subscriptionStatus: 'active',
          subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        });
      }
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get payment history
router.get('/history', auth, async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.userId })
      .populate('listing', 'title')
      .sort({ createdAt: -1 });

    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get payment pricing
router.get('/pricing', (req, res) => {
  res.json({
    listingFee: 500, // KES 500 per listing per month
    connectionFee: 100, // KES 100 per connection
    subscriptionFee: 1000 // KES 1000 per month for landlords
  });
});

module.exports = router;