const express = require('express');
const Listing = require('../models/Listing');
const User = require('../models/User');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Get all active listings
router.get('/', async (req, res) => {
  try {
    const { county, town, propertyType, minPrice, maxPrice, university } = req.query;
    
    let filter = { 
      isActive: true, 
      paymentStatus: 'paid',
      availabilityStatus: 'available'
    };
    
    if (county) filter['location.county'] = new RegExp(county, 'i');
    if (town) filter['location.town'] = new RegExp(town, 'i');
    if (propertyType) filter.propertyType = propertyType;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (university) {
      filter['nearbyUniversities.name'] = new RegExp(university, 'i');
    }

    const listings = await Listing.find(filter)
      .populate('landlord', 'name phone email')
      .sort({ createdAt: -1 });

    res.json(listings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single listing
router.get('/:id', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate('landlord', 'name phone email');
    
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Increment views
    listing.views += 1;
    await listing.save();

    res.json(listing);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create listing (landlord only)
router.post('/', auth, upload.array('images', 5), async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (user.userType !== 'landlord') {
      return res.status(403).json({ message: 'Only landlords can create listings' });
    }

    const {
      title,
      description,
      price,
      county,
      town,
      address,
      propertyType,
      amenities,
      nearbyUniversities
    } = req.body;

    const images = req.files ? req.files.map(file => file.filename) : [];

    // Validate image count
    if (images.length > 5) {
      return res.status(400).json({ message: 'Maximum 5 images allowed per listing' });
    }

    const listing = new Listing({
      title,
      description,
      price: Number(price),
      location: { county, town, address },
      propertyType,
      amenities: amenities ? JSON.parse(amenities) : [],
      images,
      landlord: req.userId,
      nearbyUniversities: nearbyUniversities ? JSON.parse(nearbyUniversities) : [],
      availabilityStatus: 'available'
    });

    await listing.save();

    res.status(201).json({
      listing,
      message: 'Listing created successfully. Payment required to activate.'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update listing (landlord only)
router.put('/:id', auth, upload.array('images', 5), async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Check if user is the landlord
    if (listing.landlord.toString() !== req.userId) {
      return res.status(403).json({ message: 'Only the landlord can edit this listing' });
    }

    const {
      title,
      description,
      price,
      county,
      town,
      address,
      propertyType,
      amenities,
      nearbyUniversities,
      keepExistingImages
    } = req.body;

    // Handle images
    let updatedImages = [];
    
    // Keep existing images if specified
    if (keepExistingImages) {
      const existingImages = JSON.parse(keepExistingImages);
      updatedImages = [...existingImages];
    }
    
    // Add new images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => file.filename);
      updatedImages = [...updatedImages, ...newImages];
    }

    // Validate total image count
    if (updatedImages.length > 5) {
      return res.status(400).json({ message: 'Maximum 5 images allowed per listing' });
    }

    // Update listing fields
    listing.title = title || listing.title;
    listing.description = description || listing.description;
    listing.price = price ? Number(price) : listing.price;
    listing.location = {
      county: county || listing.location.county,
      town: town || listing.location.town,
      address: address || listing.location.address
    };
    listing.propertyType = propertyType || listing.propertyType;
    listing.amenities = amenities ? JSON.parse(amenities) : listing.amenities;
    listing.images = updatedImages;
    listing.nearbyUniversities = nearbyUniversities ? JSON.parse(nearbyUniversities) : listing.nearbyUniversities;

    await listing.save();

    res.json({
      listing,
      message: 'Listing updated successfully!'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get landlord's listings
router.get('/my/listings', auth, async (req, res) => {
  try {
    const listings = await Listing.find({ landlord: req.userId })
      .sort({ createdAt: -1 });
    
    res.json(listings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark listing as not available (landlord only)
router.patch('/:id/mark-unavailable', auth, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Check if user is the landlord
    if (listing.landlord.toString() !== req.userId) {
      return res.status(403).json({ message: 'Only the landlord can mark this listing as unavailable' });
    }

    // Check if already marked as unavailable
    if (listing.availabilityStatus === 'not_available') {
      return res.status(400).json({ message: 'Listing is already marked as unavailable' });
    }

    const now = new Date();
    const deletionTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

    listing.availabilityStatus = 'not_available';
    listing.markedUnavailableAt = now;
    listing.scheduledDeletionAt = deletionTime;

    await listing.save();

    res.json({
      message: 'Listing marked as unavailable. It will be automatically deleted in 24 hours.',
      scheduledDeletionAt: deletionTime
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Restore listing availability (landlord only) - can be used within 24 hours
router.patch('/:id/restore-availability', auth, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Check if user is the landlord
    if (listing.landlord.toString() !== req.userId) {
      return res.status(403).json({ message: 'Only the landlord can restore this listing' });
    }

    // Check if listing is marked as unavailable
    if (listing.availabilityStatus !== 'not_available') {
      return res.status(400).json({ message: 'Listing is not marked as unavailable' });
    }

    listing.availabilityStatus = 'available';
    listing.markedUnavailableAt = null;
    listing.scheduledDeletionAt = null;

    await listing.save();

    res.json({
      message: 'Listing availability restored successfully.'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;