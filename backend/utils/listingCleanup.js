const Listing = require('../models/Listing');

// Function to delete listings that have been marked unavailable for 24+ hours
const cleanupUnavailableListings = async () => {
  try {
    const now = new Date();
    
    // Find listings that should be deleted
    const listingsToDelete = await Listing.find({
      availabilityStatus: 'not_available',
      scheduledDeletionAt: { $lte: now }
    });

    if (listingsToDelete.length > 0) {
      // Delete the listings
      const result = await Listing.deleteMany({
        availabilityStatus: 'not_available',
        scheduledDeletionAt: { $lte: now }
      });

      console.log(`🗑️  Cleaned up ${result.deletedCount} unavailable listings`);
      
      return {
        deletedCount: result.deletedCount,
        deletedListings: listingsToDelete.map(l => ({
          id: l._id,
          title: l.title,
          markedUnavailableAt: l.markedUnavailableAt
        }))
      };
    }

    return { deletedCount: 0, deletedListings: [] };
  } catch (error) {
    console.error('Error during listing cleanup:', error);
    throw error;
  }
};

// Function to get listings that will be deleted soon (within next hour)
const getListingsPendingDeletion = async () => {
  try {
    const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000);
    
    const pendingListings = await Listing.find({
      availabilityStatus: 'not_available',
      scheduledDeletionAt: { $lte: oneHourFromNow }
    }).populate('landlord', 'name email');

    return pendingListings;
  } catch (error) {
    console.error('Error fetching pending deletion listings:', error);
    throw error;
  }
};

// Function to start the cleanup interval (run every hour)
const startCleanupScheduler = () => {
  // Run cleanup immediately on start
  cleanupUnavailableListings();
  
  // Then run every hour
  setInterval(async () => {
    try {
      await cleanupUnavailableListings();
    } catch (error) {
      console.error('Scheduled cleanup failed:', error);
    }
  }, 60 * 60 * 1000); // 1 hour in milliseconds

  console.log('📅 Listing cleanup scheduler started (runs every hour)');
};

module.exports = {
  cleanupUnavailableListings,
  getListingsPendingDeletion,
  startCleanupScheduler
};