const express = require('express');
const mongoose = require('mongoose');
const Review = require('../models/Review');
const Listing = require('../models/Listing');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Get reviews for a listing
router.get('/listing/:listingId', async (req, res) => {
  try {
    const reviews = await Review.find({ listing: req.params.listingId })
      .populate('user', 'name')
      .sort({ createdAt: -1 });
    
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a review
router.post('/', auth, async (req, res) => {
  try {
    const { listingId, rating, comment } = req.body;
    
    // Check if user already reviewed this listing
    const existingReview = await Review.findOne({
      listing: listingId,
      user: req.userId
    });
    
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this property' });
    }
    
    // Check if listing exists
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    
    const review = new Review({
      listing: listingId,
      user: req.userId,
      rating,
      comment
    });
    
    await review.save();
    
    // Populate user info for response
    await review.populate('user', 'name');
    
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get review statistics
router.get('/stats', async (req, res) => {
  try {
    const totalReviews = await Review.countDocuments();
    const avgRating = await Review.aggregate([
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        }
      }
    ]);
    
    // Count unique users who have left reviews (happy students)
    const happyStudents = await Review.distinct('user').then(users => users.length);
    
    res.json({
      totalReviews,
      averageRating: avgRating.length > 0 ? avgRating[0].averageRating : 0,
      happyStudents
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get listing rating summary
router.get('/listing/:listingId/summary', async (req, res) => {
  try {
    const summary = await Review.aggregate([
      { $match: { listing: mongoose.Types.ObjectId(req.params.listingId) } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          ratings: {
            $push: '$rating'
          }
        }
      }
    ]);
    
    if (summary.length === 0) {
      return res.json({
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      });
    }
    
    const result = summary[0];
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    
    result.ratings.forEach(rating => {
      ratingDistribution[rating]++;
    });
    
    res.json({
      averageRating: result.averageRating,
      totalReviews: result.totalReviews,
      ratingDistribution
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update review helpfulness
router.patch('/:reviewId/helpful', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    review.helpfulVotes += 1;
    await review.save();
    
    res.json({ helpfulVotes: review.helpfulVotes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;