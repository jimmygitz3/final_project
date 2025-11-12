const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  location: {
    county: {
      type: String,
      required: true
    },
    town: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    }
  },
  propertyType: {
    type: String,
    enum: ['single-room', 'bedsitter', '1-bedroom', '2-bedroom', '3-bedroom', 'shared-room'],
    required: true
  },
  amenities: [{
    type: String
  }],
  images: {
    type: [{
      type: String
    }],
    validate: {
      validator: function(v) {
        return v.length <= 5;
      },
      message: 'Maximum 5 images allowed per listing'
    }
  },
  landlord: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  nearbyUniversities: [{
    name: String,
    distance: String
  }],
  isActive: {
    type: Boolean,
    default: false
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'expired'],
    default: 'pending'
  },
  paymentExpiry: {
    type: Date
  },
  views: {
    type: Number,
    default: 0
  },
  availabilityStatus: {
    type: String,
    enum: ['available', 'not_available', 'pending_deletion'],
    default: 'available'
  },
  markedUnavailableAt: {
    type: Date
  },
  scheduledDeletionAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Listing', listingSchema);
