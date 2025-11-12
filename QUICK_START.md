# Quick Start Guide - Restructured Project

## Project Overview

This project has been restructured with a **flat backend folder structure** for easier deployment and maintenance.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## Installation & Setup

### 1. Install Root Dependencies
```bash
npm install
```

### 2. Install Backend Dependencies
```bash
cd backend
npm install
cd ..
```

### 3. Install Frontend Dependencies
```bash
cd frontend
npm install
cd ..
```

Or use the convenience script:
```bash
npm run install-all
```

## Environment Configuration

### Backend Environment Variables

Create `backend/.env`:
```env
MONGODB_URI=mongodb://localhost:27017/kejah
JWT_SECRET=your_secret_key_here
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### Frontend Environment Variables

Create `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:5000
```

For production, create `frontend/.env.production`:
```env
REACT_APP_API_URL=https://your-backend-url.vercel.app
```

## Running the Application

### Option 1: Run Everything Together (Recommended)
```bash
npm run dev
```
This starts both backend (port 5000) and frontend (port 3000) concurrently.

### Option 2: Run Separately

**Backend Only:**
```bash
npm run server
# or
cd backend
npm start
```

**Frontend Only:**
```bash
npm run client
# or
cd frontend
npm start
```

## Verify Installation

### Check Backend
1. Backend should start on `http://localhost:5000`
2. Visit `http://localhost:5000/api/health` - should return `{"status":"OK"}`
3. Check MongoDB connection in console logs

### Check Frontend
1. Frontend should start on `http://localhost:3000`
2. Browser should open automatically
3. You should see the Kejah homepage

## Project Structure

### Backend (Flat Structure)
```
backend/
├── *.model.js          # Database models
├── *.route.js          # API routes
├── *.middleware.js     # Middleware functions
├── *.util.js           # Utility functions
├── server.js           # Express server
├── index.js            # Vercel entry point
└── vercel.json         # Deployment config
```

### Frontend (Standard React)
```
frontend/src/
├── components/         # Reusable components
├── contexts/           # React contexts
├── pages/              # Page components
├── data/               # Static data
└── App.js              # Main app
```

## Key Features

### For Students
- Browse properties by location and university
- Filter by price, type, and amenities
- Save favorites
- Contact landlords (with connection fee)

### For Landlords
- Create property listings
- Upload up to 5 images per listing
- Pay listing fees (KES 500/month)
- View analytics and manage listings

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Listings
- `GET /api/listings` - Get all listings (with filters)
- `GET /api/listings/:id` - Get single listing
- `POST /api/listings` - Create listing (landlord only)
- `PUT /api/listings/:id` - Update listing
- `GET /api/listings/my/listings` - Get user's listings

### Payments (Demo Mode)
- `POST /api/payments/demo/initiate` - Start payment
- `POST /api/payments/demo/complete` - Complete payment
- `GET /api/payments/history` - Payment history
- `GET /api/payments/pricing` - Get pricing info

### Reviews
- `GET /api/reviews/listing/:listingId` - Get listing reviews
- `POST /api/reviews` - Create review
- `GET /api/reviews/stats` - Get review statistics

### Connections
- `GET /api/connections/check/:listingId` - Check access
- `GET /api/connections/my-connections` - Get user connections

## Testing

### Manual Testing
1. Register as a tenant
2. Browse listings
3. Register as a landlord
4. Create a listing
5. Make a demo payment
6. Test all features

### API Testing
Use Postman or curl:
```bash
# Health check
curl http://localhost:5000/api/health

# Get listings
curl http://localhost:5000/api/listings

# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123","phone":"0712345678","userType":"tenant","university":"University of Nairobi"}'
```

## Common Issues

### Port Already in Use
```bash
# Kill process on port 5000 (backend)
npx kill-port 5000

# Kill process on port 3000 (frontend)
npx kill-port 3000
```

### MongoDB Connection Error
- Ensure MongoDB is running
- Check MONGODB_URI in .env
- For Atlas, check network access and credentials

### Module Not Found
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# For backend
cd backend
rm -rf node_modules package-lock.json
npm install

# For frontend
cd frontend
rm -rf node_modules package-lock.json
npm install
```

## Deployment

See `DEPLOYMENT_GUIDE.md` for detailed deployment instructions to Vercel.

Quick deploy:
```bash
# Deploy backend
cd backend
vercel

# Deploy frontend
cd frontend
vercel
```

## Support

- Check `STRUCTURE.md` for project structure details
- Check `RESTRUCTURE_SUMMARY.md` for what changed
- Check `DEPLOYMENT_GUIDE.md` for deployment help

## Next Steps

1. ✅ Install dependencies
2. ✅ Configure environment variables
3. ✅ Start development servers
4. ✅ Test all features
5. ✅ Deploy to production

Happy coding! 🚀
