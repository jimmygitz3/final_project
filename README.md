# Kejah - Student Housing Platform

A MERN stack application for university students to find affordable housing across Kenya. Landlords can list properties with subscription-based payments via M-Pesa.

## Features

### For Students/Tenants
- Browse housing listings by location, price, and university proximity
- Filter properties by type, amenities, and price range
- View detailed property information with images
- Contact landlords (with connection fee)
- Create tenant accounts

### For Landlords
- Create landlord accounts
- List properties with images and details
- Pay listing fees via M-Pesa (KES 500/month per listing)
- Manage active/inactive listings
- View listing analytics (views, etc.)

### Payment System
- M-Pesa integration for all payments
- Listing fees: KES 500 per property per month
- Connection fees: KES 100 per tenant-landlord connection
- Subscription management for landlords

## Tech Stack

- **Frontend**: React.js with Material-UI
- **Backend**: Node.js with Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT tokens
- **Payments**: M-Pesa API integration
- **File Upload**: Multer for property images

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Backend Setup
1. Install dependencies:
```bash
npm install
```

2. Create `.env` file with your configuration:
```
MONGODB_URI=mongodb://localhost:27017/kejah
JWT_SECRET=your_jwt_secret
PAYMENT_MODE=demo
```

3. Start the backend server:
```bash
npm run server
```

### Frontend Setup
1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the React development server:
```bash
npm start
```

### Full Development Setup
Run both frontend and backend concurrently:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Listings
- `GET /api/listings` - Get all active listings (with filters)
- `GET /api/listings/:id` - Get single listing
- `POST /api/listings` - Create new listing (landlord only)
- `GET /api/listings/my/listings` - Get landlord's listings

### Payments
- `POST /api/payments/demo/initiate` - Initiate demo payment
- `POST /api/payments/demo/complete` - Complete demo payment
- `GET /api/payments/demo/status/:transactionId` - Get payment status
- `GET /api/payments/history` - Get payment history
- `GET /api/payments/pricing` - Get pricing information

## Project Structure

```
kejah/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Listing.js
│   │   └── Payment.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── listings.js
│   │   └── payments.js
│   ├── middleware/
│   │   └── auth.js
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── pages/
│   │   └── App.js
│   └── public/
├── uploads/ (created automatically)
├── package.json
└── README.md
```

## Usage

1. **Student Registration**: Students register with their university information
2. **Landlord Registration**: Landlords register and can create property listings
3. **Property Listing**: Landlords create listings and pay activation fees
4. **Property Search**: Students browse and filter available properties
5. **Contact Process**: Students pay connection fees to contact landlords
6. **Payment Processing**: All payments handled via M-Pesa integration

## Payment Flow

1. **Listing Fee**: Landlords pay KES 500 per property per month
2. **Connection Fee**: Tenants pay KES 100 to access landlord contact details
3. **M-Pesa Integration**: Secure payment processing with transaction tracking

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, email support@kejah.co.ke or create an issue in the repository.