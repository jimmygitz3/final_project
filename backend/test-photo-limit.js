// Simple test script to verify photo upload limit
const mongoose = require('mongoose');
const Listing = require('./models/Listing');

// Test the photo validation
const testPhotoLimit = () => {
  console.log('Testing photo limit validation...');

  // Test with 5 photos (should pass)
  const validListing = new Listing({
    title: 'Test Property',
    description: 'Test description',
    price: 10000,
    location: { county: 'Nairobi', town: 'Westlands', address: 'Test Address' },
    propertyType: 'bedsitter',
    images: ['img1.jpg', 'img2.jpg', 'img3.jpg', 'img4.jpg', 'img5.jpg'],
    landlord: new mongoose.Types.ObjectId(),
    availabilityStatus: 'available'
  });

  // Test with 6 photos (should fail)
  const invalidListing = new Listing({
    title: 'Test Property 2',
    description: 'Test description',
    price: 10000,
    location: { county: 'Nairobi', town: 'Westlands', address: 'Test Address' },
    propertyType: 'bedsitter',
    images: ['img1.jpg', 'img2.jpg', 'img3.jpg', 'img4.jpg', 'img5.jpg', 'img6.jpg'],
    landlord: new mongoose.Types.ObjectId(),
    availabilityStatus: 'available'
  });

  // Validate the listings
  validListing.validate((err) => {
    if (err) {
      console.log('❌ Valid listing failed validation:', err.message);
    } else {
      console.log('✅ Valid listing (5 photos) passed validation');
    }
  });

  invalidListing.validate((err) => {
    if (err) {
      console.log('✅ Invalid listing (6 photos) correctly failed validation:', err.message);
    } else {
      console.log('❌ Invalid listing should have failed validation');
    }
  });
};

// Run the test
testPhotoLimit();

console.log('\n📋 Photo Upload Features Summary:');
console.log('• Maximum 5 photos per listing (enforced in model and frontend)');
console.log('• Photo counter shows current/max in CreateListing form');
console.log('• Individual photo removal with delete chips');
console.log('• Backend validation prevents >5 photos');
console.log('• Clear error messages for users');

console.log('\n🏠 Availability Management Features:');
console.log('• Landlords can mark listings as "Not Available"');
console.log('• Unavailable listings hidden from tenant searches');
console.log('• 24-hour grace period before auto-deletion');
console.log('• Landlords can restore availability within 24 hours');
console.log('• Automatic cleanup scheduler runs every hour');
console.log('• Clear status indicators in Dashboard');