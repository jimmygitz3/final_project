const express = require('express');
const Payment = require('../models/Payment');
const Listing = require('../models/Listing');
const User = require('../models/User');
const auth = require('../middleware/auth');
const MpesaDaraja = require('../utils/mpesaDaraja');
const { 
  generateTransactionId, 
  generateReceiptNumber, 
  validatePhoneNumber, 
  formatPhoneNumber 
} = require('../utils/paymentHelpers');

const router = express.Router();

// Initialize M-Pesa Daraja
const mpesa = new MpesaDaraja();

// Initiate M-Pesa payment via Daraja API
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

    // Check if M-Pesa is configured and test connection
    let useDemoMode = false;
    
    if (!mpesa.isConfigured()) {
      console.log('⚠️  M-Pesa credentials not properly configured, using demo mode');
      useDemoMode = true;
    } else {
      // Test M-Pesa connection
      try {
        await mpesa.getAccessToken();
        console.log('✅ M-Pesa connection successful');
      } catch (error) {
        console.log('❌ M-Pesa connection failed, falling back to demo mode:', error.message);
        useDemoMode = true;
      }
    }

    if (useDemoMode) {
      // Fallback to demo mode if M-Pesa not configured or not accessible
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

      return res.json({
        success: true,
        paymentId: payment._id,
        message: 'Demo payment initiated. M-Pesa not available.',
        transactionId: payment.mpesaTransactionId,
        demoMode: true
      });
    }

    // Generate account reference
    const accountReference = `KEJAH-${paymentType.toUpperCase()}-${Date.now()}`;

    // Initiate STK Push
    const stkResult = await mpesa.stkPush(
      formattedPhone,
      amount,
      accountReference,
      description
    );

    if (!stkResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Failed to initiate M-Pesa payment',
        error: stkResult.error
      });
    }

    // Create payment record
    const payment = new Payment({
      user: req.userId,
      listing: listingId,
      paymentType,
      amount,
      phoneNumber: formattedPhone,
      mpesaTransactionId: stkResult.checkoutRequestId,
      description,
      status: 'pending',
      merchantRequestId: stkResult.merchantRequestId,
      checkoutRequestId: stkResult.checkoutRequestId
    });

    await payment.save();

    res.json({
      success: true,
      paymentId: payment._id,
      message: 'M-Pesa payment initiated. Please complete on your phone.',
      transactionId: payment.mpesaTransactionId,
      checkoutRequestId: stkResult.checkoutRequestId,
      merchantRequestId: stkResult.merchantRequestId
    });
  } catch (error) {
    console.error('Payment initiation error:', error);
    res.status(500).json({ message: error.message });
  }
});

// M-Pesa Daraja callback handler
router.post('/mpesa/callback', async (req, res) => {
  try {
    console.log('M-Pesa Callback received:', JSON.stringify(req.body, null, 2));

    // Validate callback data
    const callbackResult = mpesa.validateCallback(req.body);
    
    if (!callbackResult.checkoutRequestId) {
      console.error('Invalid callback data:', callbackResult);
      return res.status(400).json({ message: 'Invalid callback data' });
    }

    // Find payment by checkout request ID
    const payment = await Payment.findOne({ 
      checkoutRequestId: callbackResult.checkoutRequestId 
    }).populate('listing');

    if (!payment) {
      console.error('Payment not found for checkout request ID:', callbackResult.checkoutRequestId);
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Update payment record
    if (callbackResult.success) {
      payment.status = 'completed';
      payment.mpesaReceiptNumber = callbackResult.mpesaReceiptNumber;
      payment.transactionDate = new Date(callbackResult.transactionDate);
      
      await payment.save();
      await handlePaymentCompletion(payment);
      
      console.log('Payment completed successfully:', payment._id);
    } else {
      payment.status = 'failed';
      await payment.save();
      
      console.log('Payment failed:', callbackResult.resultDesc);
    }

    // Always respond with success to M-Pesa
    res.json({ 
      ResultCode: 0,
      ResultDesc: 'Success'
    });
  } catch (error) {
    console.error('Payment callback error:', error);
    res.status(500).json({ 
      ResultCode: 1,
      ResultDesc: 'Internal server error'
    });
  }
});

// Legacy callback for demo payments
router.post('/mpesa/demo-callback', async (req, res) => {
  try {
    const { transactionId, receiptNumber, status } = req.body;

    // Handle demo payments (when transactionId starts with DEMO or TXN)
    let payment;
    
    if (transactionId && (transactionId.startsWith('DEMO') || transactionId.startsWith('TXN'))) {
      // For demo mode, find by transaction ID or the most recent pending payment
      payment = await Payment.findOne({ mpesaTransactionId: transactionId })
        .populate('listing');
      
      if (!payment) {
        // Fallback: find the most recent pending payment
        payment = await Payment.findOne({ 
          status: 'pending' 
        }).sort({ createdAt: -1 }).populate('listing');
      }
    } else {
      // Regular payment lookup
      payment = await Payment.findOne({ mpesaTransactionId: transactionId })
        .populate('listing');
    }
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    payment.status = status;
    payment.mpesaReceiptNumber = receiptNumber || generateReceiptNumber();
    if (transactionId) {
      payment.mpesaTransactionId = transactionId;
    }
    await payment.save();

    if (status === 'completed') {
      await handlePaymentCompletion(payment);
    }

    res.json({ success: true, message: 'Payment processed successfully' });
  } catch (error) {
    console.error('Payment callback error:', error);
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

// Query M-Pesa payment status
router.post('/mpesa/query', auth, async (req, res) => {
  try {
    const { checkoutRequestId } = req.body;

    if (!checkoutRequestId) {
      return res.status(400).json({ message: 'Checkout Request ID is required' });
    }

    // Find payment in database
    const payment = await Payment.findOne({ checkoutRequestId });
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // If payment is already completed or failed, return status
    if (payment.status !== 'pending') {
      return res.json({
        success: true,
        status: payment.status,
        mpesaReceiptNumber: payment.mpesaReceiptNumber,
        transactionDate: payment.transactionDate
      });
    }

    // Query M-Pesa for status if still pending
    if (process.env.MPESA_CONSUMER_KEY && process.env.MPESA_CONSUMER_SECRET) {
      const queryResult = await mpesa.stkQuery(checkoutRequestId);
      
      if (queryResult.success) {
        const { data } = queryResult;
        
        // Update payment status based on query result
        if (data.ResultCode === '0') {
          payment.status = 'completed';
          // Note: Receipt number might not be available in query response
        } else if (data.ResultCode === '1032') {
          // User cancelled
          payment.status = 'cancelled';
        } else {
          // Other error codes indicate failure
          payment.status = 'failed';
        }
        
        await payment.save();
        
        return res.json({
          success: true,
          status: payment.status,
          resultCode: data.ResultCode,
          resultDesc: data.ResultDesc
        });
      }
    }

    // Return current status if query fails
    res.json({
      success: true,
      status: payment.status
    });
  } catch (error) {
    console.error('Payment query error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Test M-Pesa Daraja connection
router.get('/mpesa/test', async (req, res) => {
  try {
    if (!process.env.MPESA_CONSUMER_KEY || !process.env.MPESA_CONSUMER_SECRET) {
      return res.json({
        status: 'demo_mode',
        message: 'M-Pesa credentials not configured. Running in demo mode.',
        configured: false
      });
    }

    // Test access token generation
    const accessToken = await mpesa.getAccessToken();
    
    res.json({
      status: 'configured',
      message: 'M-Pesa Daraja API is properly configured and accessible.',
      configured: true,
      environment: process.env.MPESA_ENVIRONMENT,
      businessShortCode: process.env.MPESA_BUSINESS_SHORTCODE,
      hasAccessToken: !!accessToken
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'M-Pesa configuration error: ' + error.message,
      configured: false
    });
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