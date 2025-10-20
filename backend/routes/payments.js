const express = require('express');
const Payment = require('../models/Payment');
const Listing = require('../models/Listing');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Helper functions for demo payments
const generateTransactionId = () => `DEMO_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
const generateReceiptNumber = () => `REC${Date.now()}${Math.floor(Math.random() * 1000)}`;
const validatePhoneNumber = (phone) => /^254\d{9}$/.test(phone);
const formatPhoneNumber = (phone) => {
  if (phone.startsWith('0')) return '254' + phone.slice(1);
  if (phone.startsWith('+254')) return phone.slice(1);
  return phone;
};

// Initiate demo payment
router.post('/demo/initiate', auth, async (req, res) => {
  try {
    const { amount, phoneNumber, paymentType, listingId, description } = req.body;

    // Validate required fields
    if (!amount || !paymentType) {
      return res.status(400).json({ 
        message: 'Missing required fields: amount, paymentType' 
      });
    }

    // Format phone number if provided
    const formattedPhone = phoneNumber ? formatPhoneNumber(phoneNumber) : '254700000000';

    // Check for existing successful payment for this listing
    if (listingId && paymentType === 'listing_fee') {
      const existingPayment = await Payment.findOne({
        listing: listingId,
        paymentType: 'listing_fee',
        status: 'completed'
      });

      if (existingPayment) {
        return res.status(400).json({ 
          message: 'This listing has already been paid for and is active!',
          existingPayment: {
            date: existingPayment.createdAt,
            receiptNumber: existingPayment.mpesaReceiptNumber
          }
        });
      }
    }

    // Check for duplicate connection fee payments
    if (listingId && paymentType === 'connection_fee') {
      const Connection = require('../models/Connection');
      const existingConnection = await Connection.findOne({
        tenant: req.userId,
        listing: listingId
      });

      if (existingConnection) {
        return res.status(400).json({ 
          message: 'You already have access to this landlord\'s contact information!' 
        });
      }
    }

    // Create demo payment record
    const payment = new Payment({
      user: req.userId,
      listing: listingId,
      paymentType,
      amount,
      phoneNumber: formattedPhone,
      mpesaTransactionId: generateTransactionId(),
      description: description || `Demo ${paymentType} payment`,
      status: 'pending'
    });

    await payment.save();

    res.json({
      success: true,
      paymentId: payment._id,
      message: 'Demo payment initiated successfully.',
      transactionId: payment.mpesaTransactionId,
      demoMode: true
    });
  } catch (error) {
    console.error('Demo payment initiation error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Demo payment completion
router.post('/demo/complete', auth, async (req, res) => {
  try {
    const { transactionId, status = 'completed' } = req.body;

    if (!transactionId) {
      return res.status(400).json({ message: 'Transaction ID is required' });
    }

    // Find payment by transaction ID
    const payment = await Payment.findOne({ 
      mpesaTransactionId: transactionId,
      user: req.userId 
    }).populate('listing');

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Update payment status
    payment.status = status;
    payment.mpesaReceiptNumber = generateReceiptNumber();
    payment.transactionDate = new Date();
    
    await payment.save();

    if (status === 'completed') {
      await handlePaymentCompletion(payment);
    }

    res.json({ 
      success: true,
      message: 'Demo payment completed successfully',
      payment: {
        id: payment._id,
        status: payment.status,
        receiptNumber: payment.mpesaReceiptNumber,
        amount: payment.amount
      }
    });
  } catch (error) {
    console.error('Demo payment completion error:', error);
    res.status(500).json({ message: error.message });
  }
});



// Helper function to handle payment completion logic
async function handlePaymentCompletion(payment) {
  if (payment.paymentType === 'listing_fee') {
    await Listing.findByIdAndUpdate(payment.listing, {
      isActive: true,
      paymentStatus: 'paid',
      paymentExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    });
  } else if (payment.paymentType === 'connection_fee') {
    // Create connection record for tenant
    const Connection = require('../models/Connection');
    const listing = await Listing.findById(payment.listing);
    
    const connection = new Connection({
      tenant: payment.user,
      landlord: listing.landlord,
      listing: payment.listing,
      payment: payment._id,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days access
    });
    
    await connection.save();
  } else if (payment.paymentType === 'subscription') {
    await User.findByIdAndUpdate(payment.user, {
      subscriptionStatus: 'active',
      subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
  }
}

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

// Get demo payment status
router.get('/demo/status/:transactionId', auth, async (req, res) => {
  try {
    const { transactionId } = req.params;

    const payment = await Payment.findOne({ 
      mpesaTransactionId: transactionId,
      user: req.userId 
    });
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.json({
      success: true,
      status: payment.status,
      mpesaReceiptNumber: payment.mpesaReceiptNumber,
      transactionDate: payment.transactionDate,
      amount: payment.amount
    });
  } catch (error) {
    console.error('Payment status query error:', error);
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

// Check payment status for a listing
router.get('/listing/:listingId/status', auth, async (req, res) => {
  try {
    const { listingId } = req.params;
    
    const payment = await Payment.findOne({
      listing: listingId,
      paymentType: 'listing_fee',
      status: 'completed'
    }).sort({ createdAt: -1 });

    if (payment) {
      res.json({
        paid: true,
        paymentDate: payment.createdAt,
        receiptNumber: payment.mpesaReceiptNumber,
        amount: payment.amount
      });
    } else {
      res.json({
        paid: false,
        message: 'No payment found for this listing'
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;