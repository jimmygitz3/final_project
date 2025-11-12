const express = require('express');
const mongoose = require('mongoose');
const Listing = require('./Listing.model');
const Payment = require('./Payment.model');
const Review = require('./Review.model');
const auth = require('./auth.middleware');

const router = express.Router();

// Get user activity feed
router.get('/feed', auth, async (req, res) => {
  try {
    const userId = req.userId;
    const activities = [];

    // Get recent listings created by user (for landlords)
    const recentListings = await Listing.find({ landlord: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title createdAt');

    recentListings.forEach(listing => {
      activities.push({
        type: 'listing_created',
        title: 'New property listing created',
        description: `Created listing: ${listing.title}`,
        date: listing.createdAt,
        icon: 'home',
        color: 'primary'
      });
    });

    // Get recent payments
    const recentPayments = await Payment.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('amount description status createdAt');

    recentPayments.forEach(payment => {
      activities.push({
        type: 'payment',
        title: payment.status === 'completed' ? 'Payment received' : 'Payment initiated',
        description: `${payment.description} - KES ${payment.amount}`,
        date: payment.createdAt,
        icon: 'payment',
        color: payment.status === 'completed' ? 'success' : 'warning'
      });
    });

    // Get recent reviews on user's properties (for landlords)
    if (recentListings.length > 0) {
      const listingIds = recentListings.map(l => l._id);
      const recentReviews = await Review.find({ listing: { $in: listingIds } })
        .sort({ createdAt: -1 })
        .limit(3)
        .populate('user', 'name')
        .populate('listing', 'title')
        .select('rating comment createdAt');

      recentReviews.forEach(review => {
        activities.push({
          type: 'review_received',
          title: 'New review received',
          description: `${review.user.name} rated ${review.listing.title} - ${review.rating} stars`,
          date: review.createdAt,
          icon: 'star',
          color: 'info'
        });
      });
    }

    // Get view statistics for user's listings (for landlords)
    const viewStats = await Listing.aggregate([
      { $match: { landlord: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          totalViews: { $sum: '$views' },
          listings: { $push: { title: '$title', views: '$views', createdAt: '$createdAt' } }
        }
      }
    ]);

    if (viewStats.length > 0) {
      const stats = viewStats[0];
      // Add view milestones
      if (stats.totalViews >= 100) {
        activities.push({
          type: 'milestone',
          title: 'Milestone reached!',
          description: `Your properties have received ${stats.totalViews} total views`,
          date: new Date(),
          icon: 'visibility',
          color: 'secondary'
        });
      }
    }

    // Sort all activities by date (most recent first)
    activities.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json(activities.slice(0, 10)); // Return top 10 activities
  } catch (error) {
    console.error('Error fetching activity feed:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get activity statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.userId;
    
    // Count activities in the last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const recentListings = await Listing.countDocuments({
      landlord: userId,
      createdAt: { $gte: thirtyDaysAgo }
    });
    
    const recentPayments = await Payment.countDocuments({
      user: userId,
      createdAt: { $gte: thirtyDaysAgo },
      status: 'completed'
    });
    
    // Get total views in last 30 days (approximate)
    const totalViews = await Listing.aggregate([
      { $match: { landlord: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, totalViews: { $sum: '$views' } } }
    ]);
    
    const viewsCount = totalViews.length > 0 ? totalViews[0].totalViews : 0;
    
    res.json({
      recentListings,
      recentPayments,
      totalViews: viewsCount,
      period: '30 days'
    });
  } catch (error) {
    console.error('Error fetching activity stats:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
