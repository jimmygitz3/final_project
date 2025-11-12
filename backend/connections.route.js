const express = require('express');
const Connection = require('./Connection.model');
const Payment = require('./Payment.model');
const Listing = require('./Listing.model');
const auth = require('./auth.middleware');

const router = express.Router();

// Check if tenant has access to landlord contact for a listing
router.get('/check/:listingId', auth, async (req, res) => {
  try {
    const connection = await Connection.findOne({
      tenant: req.userId,
      listing: req.params.listingId,
      status: 'active',
      expiresAt: { $gt: new Date() }
    }).populate('payment');

    if (connection) {
      res.json({
        hasAccess: true,
        connection,
        paymentDate: connection.payment.createdAt,
        expiresAt: connection.expiresAt
      });
    } else {
      res.json({
        hasAccess: false,
        message: 'Payment required to access contact details'
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get tenant's connections
router.get('/my-connections', auth, async (req, res) => {
  try {
    const connections = await Connection.find({ tenant: req.userId })
      .populate('listing', 'title location price')
      .populate('landlord', 'name phone email')
      .populate('payment', 'amount createdAt')
      .sort({ createdAt: -1 });

    res.json(connections);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
