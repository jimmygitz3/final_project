# Stripe M-Pesa Integration Setup Guide

## 🚀 Overview

The Kejah platform now uses **Stripe M-Pesa integration** for all payments, replacing the mock payment system with real M-Pesa processing through Stripe's infrastructure.

## 📋 Prerequisites

1. **Stripe Account**: Create a Stripe account at [stripe.com](https://stripe.com)
2. **M-Pesa Business Account**: Required for live payments in Kenya
3. **Node.js & npm**: For running the application
4. **MongoDB**: Database for storing payment records

## 🔧 Setup Instructions

### 1. Stripe Account Configuration

1. **Create Stripe Account**
   - Sign up at [stripe.com](https://stripe.com)
   - Complete business verification
   - Enable M-Pesa payment method in your dashboard

2. **Get API Keys**
   - Navigate to Developers > API keys
   - Copy your **Publishable key** (pk_test_...)
   - Copy your **Secret key** (sk_test_...)

3. **Configure Webhooks**
   - Go to Developers > Webhooks
   - Add endpoint: `https://yourdomain.com/api/payments/stripe/webhook`
   - Select events:
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `payment_intent.canceled`
   - Copy the **Webhook signing secret** (whsec_...)

### 2. Environment Variables

**Backend (.env)**
```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/kejah

# JWT
JWT_SECRET=your_jwt_secret_key_here

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Server
PORT=5000
NODE_ENV=development
```

**Frontend (.env)**
```env
# Stripe
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here

# API
REACT_APP_API_URL=http://localhost:5000
```

### 3. Install Dependencies

**Backend**
```bash
cd backend
npm install stripe
```

**Frontend**
```bash
cd frontend
npm install @stripe/stripe-js @stripe/react-stripe-js
```

## 💳 Payment Flow

### 1. Payment Initiation
- User clicks payment button (listing fee, connection fee, subscription)
- Frontend opens Stripe payment dialog
- Backend creates Stripe PaymentIntent with M-Pesa configuration

### 2. M-Pesa Processing
- User enters M-Pesa phone number
- Stripe handles M-Pesa STK push to user's phone
- User completes payment on mobile device

### 3. Payment Confirmation
- Stripe webhook notifies backend of payment status
- Backend updates payment record and triggers business logic
- Frontend receives confirmation and updates UI

## 🔄 Payment Types

### 1. Listing Fee (KES 500)
- **Purpose**: Activate property listing for 30 days
- **Trigger**: After creating a new listing
- **Business Logic**: Sets `isActive: true`, `paymentStatus: 'paid'`

### 2. Connection Fee (KES 100)
- **Purpose**: Unlock landlord contact information
- **Trigger**: When tenant wants to contact landlord
- **Business Logic**: Creates connection record with 30-day access

### 3. Subscription Fee (KES 1000+)
- **Purpose**: Premium landlord features
- **Trigger**: Upgrading to premium plan
- **Business Logic**: Updates user subscription status

## 🛡️ Security Features

### 1. Webhook Verification
- All webhooks verified using Stripe signature
- Prevents unauthorized payment confirmations
- Logs all webhook events for audit trail

### 2. Payment Validation
- Phone number format validation (254XXXXXXXXX)
- Duplicate payment prevention
- User authorization checks

### 3. Error Handling
- Comprehensive error logging
- Graceful failure handling
- User-friendly error messages

## 📊 Database Schema Updates

### Payment Model
```javascript
{
  user: ObjectId,
  listing: ObjectId, // Optional
  paymentType: String, // 'listing_fee', 'connection_fee', 'subscription'
  amount: Number,
  phoneNumber: String,
  mpesaTransactionId: String, // Stripe PaymentIntent ID
  mpesaReceiptNumber: String,
  stripePaymentIntentId: String, // New field
  stripePaymentMethodId: String, // New field
  status: String, // 'pending', 'completed', 'failed', 'cancelled'
  description: String,
  createdAt: Date
}
```

## 🧪 Testing

### 1. Test Mode
- Use Stripe test keys (pk_test_, sk_test_)
- Test M-Pesa numbers: Use Stripe's test phone numbers
- No real money is charged in test mode

### 2. Test Scenarios
```javascript
// Test successful payment
{
  phoneNumber: "254700000000", // Stripe test number
  amount: 500,
  paymentType: "listing_fee"
}

// Test failed payment
{
  phoneNumber: "254700000001", // Stripe test failure number
  amount: 100,
  paymentType: "connection_fee"
}
```

## 🚀 Deployment

### 1. Production Setup
- Replace test keys with live Stripe keys
- Update webhook URL to production domain
- Configure proper SSL certificates
- Set up monitoring and logging

### 2. Environment Variables (Production)
```env
STRIPE_SECRET_KEY=sk_live_your_live_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_live_webhook_secret
NODE_ENV=production
```

## 📈 Monitoring & Analytics

### 1. Stripe Dashboard
- Real-time payment monitoring
- Transaction history and analytics
- Dispute and refund management
- Revenue reporting

### 2. Application Logs
- Payment initiation logs
- Webhook processing logs
- Error tracking and alerts
- Performance monitoring

## 🔧 Troubleshooting

### Common Issues

1. **Webhook Not Receiving Events**
   - Check webhook URL is accessible
   - Verify webhook secret is correct
   - Check firewall settings

2. **Payment Fails Immediately**
   - Verify Stripe keys are correct
   - Check phone number format
   - Ensure M-Pesa is enabled in Stripe

3. **Frontend Errors**
   - Verify REACT_APP_STRIPE_PUBLISHABLE_KEY is set
   - Check browser console for errors
   - Ensure Stripe.js is loaded properly

### Debug Commands
```bash
# Check webhook deliveries
curl -X GET https://api.stripe.com/v1/webhook_endpoints \
  -u sk_test_your_secret_key:

# Test payment intent creation
curl -X POST https://api.stripe.com/v1/payment_intents \
  -u sk_test_your_secret_key: \
  -d amount=50000 \
  -d currency=kes \
  -d "payment_method_types[]"=mpesa
```

## 📞 Support

- **Stripe Support**: [support.stripe.com](https://support.stripe.com)
- **M-Pesa Integration**: [stripe.com/docs/payments/mpesa](https://stripe.com/docs/payments/mpesa)
- **Webhook Guide**: [stripe.com/docs/webhooks](https://stripe.com/docs/webhooks)

## 🎉 Benefits

✅ **Real M-Pesa Integration**: Actual mobile money processing
✅ **Secure Payments**: PCI-compliant infrastructure
✅ **Automatic Reconciliation**: Real-time payment confirmation
✅ **Comprehensive Logging**: Full audit trail
✅ **Scalable Architecture**: Handles high transaction volumes
✅ **User-Friendly**: Seamless payment experience
✅ **Business Intelligence**: Rich analytics and reporting

The Stripe M-Pesa integration provides a production-ready payment solution for the Kejah platform! 🚀