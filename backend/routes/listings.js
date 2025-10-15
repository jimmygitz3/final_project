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
    
    let filter = { isActive: true, paymentStatus: 'paid' };
    
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

    const listing = new Listing({
      title,
      description,
      price: Number(price),
      location: { county, town, address },
      propertyType,
      amenities: amenities ? JSON.parse(amenities) : [],
      images,
      landlord: req.userId,
      nearbyUniversities: nearbyUniversities ? JSON.parse(nearbyUniversities) : []
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

module.exports = router;