# Project Structure - Minimized for Deployment

## Overview
This project has been restructured with a flat folder hierarchy for easier deployment and maintenance.

## Backend Structure (Flat)

All backend files are in the root `backend/` directory with clear naming conventions:

### Models (*.model.js)
- `User.model.js` - User authentication and profiles
- `Listing.model.js` - Property listings
- `Payment.model.js` - Payment transactions
- `Review.model.js` - Property reviews
- `Connection.model.js` - Tenant-landlord connections

### Routes (*.route.js)
- `auth.route.js` - Authentication endpoints
- `listings.route.js` - Property listing endpoints
- `payments.route.js` - Payment processing endpoints
- `reviews.route.js` - Review management endpoints
- `activity.route.js` - User activity feed endpoints
- `connections.route.js` - Connection management endpoints

### Middleware (*.middleware.js)
- `auth.middleware.js` - JWT authentication middleware

### Utilities (*.util.js)
- `listingCleanup.util.js` - Automated listing cleanup scheduler

### Core Files
- `server.js` - Express server configuration
- `index.js` - Entry point for serverless deployment (Vercel)
- `vercel.json` - Vercel deployment configuration

## Frontend Structure (Organized)

The frontend maintains a logical folder structure for React best practices:

```
frontend/src/
├── components/          # Reusable UI components
│   ├── Navbar.js
│   ├── PropertyCard.js
│   ├── SearchFilters.js
│   ├── ReviewSection.js
│   ├── MockPayment.js
│   ├── StatsCard.js
│   └── UpgradeModal.js
├── contexts/            # React context providers
│   └── AuthContext.js
├── pages/               # Page-level components
│   ├── Home.js
│   ├── Login.js
│   ├── Register.js
│   ├── Dashboard.js
│   ├── ListingDetails.js
│   ├── CreateListing.js
│   ├── EditListing.js
│   └── Favorites.js
├── data/                # Static data
│   └── kenyanLocations.js
└── App.js               # Main application component
```

## Benefits of This Structure

### Backend (Flat)
1. **Easy Navigation** - All files in one directory
2. **Clear Naming** - File purpose obvious from name
3. **Deployment Friendly** - No complex path resolution
4. **Vercel Compatible** - Simplified serverless deployment
5. **Maintenance** - Quick file location and updates

### Frontend (Organized)
1. **React Best Practices** - Standard folder organization
2. **Scalability** - Easy to add new components/pages
3. **Team Collaboration** - Clear file organization
4. **Code Reusability** - Components easily shared

## File Naming Conventions

### Backend
- Models: `[EntityName].model.js` (e.g., `User.model.js`)
- Routes: `[resource].route.js` (e.g., `auth.route.js`)
- Middleware: `[purpose].middleware.js` (e.g., `auth.middleware.js`)
- Utilities: `[purpose].util.js` (e.g., `listingCleanup.util.js`)

### Frontend
- Components: `PascalCase.js` (e.g., `PropertyCard.js`)
- Pages: `PascalCase.js` (e.g., `Dashboard.js`)
- Contexts: `[Name]Context.js` (e.g., `AuthContext.js`)

## Import Examples

### Backend Imports (Flat Structure)
```javascript
// In server.js
const authRoutes = require('./auth.route');
const User = require('./User.model');
const auth = require('./auth.middleware');
const { startCleanupScheduler } = require('./listingCleanup.util');
```

### Frontend Imports (Organized Structure)
```javascript
// In App.js
import Navbar from './components/Navbar';
import Home from './pages/Home';
import { AuthProvider } from './contexts/AuthContext';
import { kenyanCounties } from './data/kenyanLocations';
```

## Deployment Configuration

### Backend (Vercel)
- Entry point: `backend/index.js`
- Serverless function: Exports Express app
- Configuration: `backend/vercel.json`

### Frontend (Vercel)
- Build command: `npm run build`
- Output directory: `build`
- Configuration: `vercel.json` (root)

## Migration Notes

If you're updating from the old nested structure:
1. All backend files moved from subdirectories to root `backend/`
2. Import paths updated to reflect flat structure
3. File names updated with category suffixes
4. Old folders (`api/`, `models/`, `routes/`, `middleware/`, `utils/`) removed
5. Frontend structure unchanged (already optimal)
