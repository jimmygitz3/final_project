const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing'
  },
  paymentType: {
    type: String,
    enum: ['listing_fee', 'connection_fee', 'subscription'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  mpesaTransactionId: {
    type: String,
    required: true
  },
  mpesaReceiptNumber: {
    type: String
  },
  merchantRequestId: {
    type: String
  },
  checkoutRequestId: {
    type: String
  },
  transactionDate: {
    type: Date
  },
  phoneNumber: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  description: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Payment', paymentSchema);