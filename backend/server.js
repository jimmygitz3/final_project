const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./auth.route');
const listingRoutes = require('./listings.route');
const paymentRoutes = require('./payments.route');
const reviewRoutes = require('./reviews.route');
const activityRoutes = require('./activity.route');
const connectionRoutes = require('./connections.route');

// Import utilities
const { startCleanupScheduler } = require('./listingCleanup.util');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL || 'https://your-frontend-app.vercel.app'] 
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Kejah API is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/connections', connectionRoutes);

// MongoDB connection
let isConnected = false;

const connectToDatabase = async () => {
  if (isConnected) {
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kejah', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    isConnected = true;
    console.log('Connected to MongoDB');
    
    // Start the listing cleanup scheduler only in non-serverless environment
    if (process.env.NODE_ENV !== 'production') {
      startCleanupScheduler();
    }
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
};

// Connect to database
connectToDatabase();

// For Vercel serverless functions
if (process.env.NODE_ENV === 'production') {
  module.exports = app;
} else {
  // For local development
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Kejah Server running on port ${PORT}`);
  });
}