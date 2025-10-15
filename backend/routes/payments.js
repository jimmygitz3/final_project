const express = require('express');
const Payment = require('../models/Payment');
const Listing = require('../models/Listing');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { 
  generateTransactionId, 
  generateReceiptNumber, 
  validatePhoneNumber, 
  formatPhoneNumber 
} = require('../utils/paymentHelpers');

const router = express.Router();

// Initiate M-Pesa payment
router.post('/mpesa/initiate', auth, async (req, res) => {
  try {
    const { amount, phoneNumber, paymentType, listingId, description } = req.body;

    // Validate required fields
    if (!amount || !phoneNumber || !paymentType) {
      return res.status(400).json({ 
        message: 'Missing required fields: amount, phoneNumber, paymentType' 
      });
    }

    // Format and validate phone number
    const formattedPhone = formatPhoneNumber(phoneNumber);
    if (!validatePhoneNumber(formattedPhone)) {
      return res.status(400).json({ 
        message: 'Invalid phone number format. Use 254XXXXXXXXX format.' 
      });
    }

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

    // Create payment record
    const payment = new Payment({
      user: req.userId,
      listing: listingId,
      paymentType,
      amount,
      phoneNumber: formattedPhone,
      mpesaTransactionId: generateTransactionId(),
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

    const payment = await Payment.findOne({ mpesaTransactionId: transactionId })
      .populate('listing');
    
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
      } else if (payment.paymentType === 'connection_fee') {
        // Create connection record for tenant
        const Connection = require('../models/Connection');
        const listing = await Listing.findById(payment.listing);
        
        const connection = new Connection({
          tenant: payment.user,
          landlord: listing.landlord,
          listing: payment.listing,
          payment: payment._id
        });
        
        await connection.save();
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